---
id: harvester-cluster
title: Harvester Cluster
sidebar_label: Harvester Cluster
sidebar_position: 4
---

# Harvester Cluster

Three Intel NUC nodes (`nuc-01`, `nuc-02`, `nuc-03`) form a Harvester hyperconverged infrastructure cluster. Harvester provides both virtual machine hosting and Kubernetes workload management on the same hardware.

## Prerequisites

Before booting the Harvester nodes:

- [ ] `nuc-00-01` is running — DHCP and DNS are healthy
- [ ] `nuc-00-03` is running — HAProxy and Keepalived VIP are up
- [ ] Harvester ISO artifacts are hosted on `nuc-00` Apache
- [ ] iPXE menu and config templates are rendered and in place
- [ ] Root CA has been generated (`02_setup_ca.sh`)

## Node Roles

| Host | IP | Role |
|:-----|:---|:-----|
| nuc-01 | `${IP_PREFIX}.101` | First node — creates the cluster |
| nuc-02 | `${IP_PREFIX}.102` | Joins the cluster |
| nuc-03 | `${IP_PREFIX}.103` | Joins the cluster |
| harvester (VIP) | `${IP_PREFIX}.100` | Cluster API/UI virtual IP |

## Installation

Follow the [PXE Boot](./pxe-boot.md) guide. Boot nodes in order — `nuc-01` first, then `nuc-02`, then `nuc-03`. Wait for each node to complete installation and appear in the Harvester UI before booting the next.

The per-node config files (`config-create-nuc-01.yaml`, `config-join-nuc-0x.yaml`) are served over HTTP and handle the full automated install — no manual input required after selecting the menu option.

## Post-Install Configuration

After all three nodes have joined the cluster, run:

```bash
bash Scripts/07_post_configure_harvester.sh
```

This script handles:
- Installing the root CA into Harvester's trusted certificate store
- Uploading cloud images used for VM provisioning
- Configuring the registry mirror (environment-specific — points to Harbor for Enclave, public registry for Community)

## Verification

```bash
# Harvester UI should be accessible
curl -sk https://${IP_PREFIX}.100/dashboard/ | grep -i harvester

# All nodes should be in Ready state
kubectl --kubeconfig ~/.kube/harvester.yaml get nodes
```

Expected output:
```
NAME     STATUS   ROLES                       AGE
nuc-01   Ready    control-plane,etcd,master   ...
nuc-02   Ready    control-plane,etcd,master   ...
nuc-03   Ready    control-plane,etcd,master   ...
```

## Storage

Harvester uses [Longhorn](https://longhorn.io) for distributed block storage. Each Harvester node contributes its available disks to the Longhorn pool. The cluster tolerates the loss of one node.

Default storage class: `harvester-longhorn`

## Networking

Harvester's VM networking is handled by a secondary NIC on each node (the `nuc-0x-vms` ports in the switch layout). The management network (primary NIC) carries cluster traffic; the VM network carries workload traffic.
