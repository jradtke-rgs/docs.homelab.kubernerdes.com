---
id: lab-management
title: Lab Management
sidebar_label: Lab Management
sidebar_position: 3
---

# Lab Management

`labctl` is the single entry point for powering the lab down and bringing it back up in the correct dependency order. It discovers running VMs dynamically from the Harvester API so no hardcoded inventory is needed (Rancher Manager VMs are the only exception — they have a fixed startup order).

## Prerequisites

Each subcommand requires kubeconfigs to be present on nuc-00 before it will run. If a kubeconfig is missing, `labctl` will exit immediately with the exact command needed to retrieve it.

| Kubeconfig | Path | Required by |
|:-----------|:-----|:------------|
| Harvester | `~/.kube/${ENVIRONMENT}-harvester.kubeconfig` | `shutdown`, `startup`, `status` |
| Rancher Manager | `~/.kube/${ENVIRONMENT}-rancher.kubeconfig` | `startup`, `status` |
| Observability | `~/.kube/${ENVIRONMENT}-observability.kubeconfig` | `startup`, `status` |
| Apps | `~/.kube/${ENVIRONMENT}-apps.kubeconfig` | `startup`, `status` |

Retrieve a missing kubeconfig from the relevant node (example for Harvester):

```bash
ssh rancher@${NUC01_IP} 'sudo cat /etc/rancher/rke2/rke2.yaml' \
  | sed "s/127.0.0.1/${HARVESTER_VIP}/" > ~/.kube/${ENVIRONMENT}-harvester.kubeconfig
chmod 600 ~/.kube/${ENVIRONMENT}-harvester.kubeconfig
```

---

## Usage

```bash
./Scripts/labctl {shutdown|startup|status}

# Target a specific environment (default: community)
ENVIRONMENT=carbide ./Scripts/labctl status
```

---

## status

A read-only snapshot of the entire lab. Safe to run at any time — including mid-shutdown or mid-startup to check progress.

```bash
./Scripts/labctl status
```

Output sections:

| Section | Source |
|:--------|:-------|
| Infrastructure VMs | `virsh list --all` on nuc-00 |
| Harvester nodes | `kubectl get nodes` (Harvester kubeconfig) |
| Harvester VMs | `kubectl get virtualmachine -n default` |
| Rancher Manager nodes | `kubectl get nodes` (Rancher kubeconfig) |
| Observability nodes | `kubectl get nodes` (Observability kubeconfig) |
| Apps nodes | `kubectl get nodes` (Apps kubeconfig) |

Each section degrades gracefully — if a kubeconfig is absent or the API is unreachable it prints a note rather than aborting.

---

## shutdown

Stops all components cleanly in dependency order.

```bash
./Scripts/labctl shutdown
```

Sequence:

1. **Discover running VMs** — queries Harvester API; partitions into rancher vs. everything else
2. **Stop non-rancher VMs** — all other running VMs stopped simultaneously, then waits for each to reach Stopped state
3. **Stop rancher VMs** — stopped second-to-last, waits for Stopped state
4. **SSH shutdown Harvester nodes** — `sudo shutdown -h now` to each NUC (staggered 15s apart)
5. **Wait for Harvester nodes offline** — polls ping until unreachable
6. **Stop nuc-00 infrastructure VMs** — `virsh shutdown` for nuc-00-03, nuc-00-02, nuc-00-01

> **Note:** Steps 2–3 operate on whatever VMs are actually running at the time. If observability or apps VMs don't exist yet in a partially-built lab, they are simply skipped.

---

## startup

Brings the lab back up in reverse dependency order, waiting for each layer to be healthy before proceeding.

```bash
./Scripts/labctl startup
```

Sequence:

1. **Start nuc-00 infrastructure VMs** — `virsh start` for nuc-00-01/02/03; waits for DNS to respond on port 53
2. **Wake Harvester nodes** — sends Wake-on-LAN packets via `wake_host` (20s between each node)
3. **Wait for Harvester to settle** — polls `kubectl get nodes` until all 3 nodes are Ready (10 min timeout)
4. **Start rancher VMs** — starts rancher-01/02/03; waits for Rancher Manager cluster to reach 3/3 nodes Ready
5. **Start remaining VMs** — discovers all stopped non-rancher VMs; starts them one at a time (30s between each), sorted alphabetically

---

## wake_host

`wake_host` sends Wake-on-LAN magic packets to the physical NUC nodes. It is called automatically by `labctl startup` but can also be used standalone.

```bash
# Wake a single node
ENVIRONMENT=community ./Scripts/wake_host nuc-11

# Wake all nodes for the active environment (20s delay between each)
ENVIRONMENT=carbide ./Scripts/wake_host all

# List available hosts for the active environment
./Scripts/wake_host list
```

The active host table is selected by `ENVIRONMENT`:

| Environment | Hosts | Hardware |
|:------------|:------|:---------|
| `community` | nuc-11, nuc-12, nuc-13 | Gen13 NUCs |
| `carbide` | nuc-01, nuc-02, nuc-03 | Gen10 NUCs |
| `enclave` | nuc-01, nuc-02, nuc-03 | Gen10 NUCs |

`ENVIRONMENT` defaults to `community` if not set.
