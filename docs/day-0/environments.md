---
id: environments
title: Environments
sidebar_label: Environments
sidebar_position: 1
---

# Environments

The homelab supports three deployment environments from a single shared codebase. Environment-specific behavior is driven entirely by configuration — the scripts themselves contain no branching logic.

## The Three Environments

| Environment | Description | CIDR | Domain |
|:-----------:|:------------|:----:|:-------|
| **Community** | SUSE/upstream bits pulled from public registries | 10.0.0.0/22 | community.kubernerdes.com |
| **Carbide** | RGS software pulled from the RGS registry over the internet | 10.10.12.0/22 | carbide.kubernerdes.com |
| **Enclave** | RGS software synced via Hauler, served from a local Harbor registry (air-gapped) | 10.10.12.0/22 | enclave.kubernerdes.com |

Carbide and Enclave share the same CIDR — they are never deployed simultaneously. They represent different software delivery approaches on the same physical hardware.

**Recommended progression:** Community MVP → Carbide → Enclave

---

## Community

Community is the base environment — using upstream SUSE tooling pulled directly from public container registries (Docker Hub, GitHub Container Registry, etc.).

**Use when:**
- Getting started with the platform for the first time
- You don't have an RGS Carbide license
- You want the simplest possible deployment path

**What's different:** No special registry credentials required. Images pull from public sources by default.

---

## Carbide

Carbide uses RGS (Rancher Government Solutions) hardened container images pulled from the RGS registry (`registry.ranchercarbide.dev`) over the internet.

**Use when:**
- Demonstrating RGS Carbide to customers or colleagues
- You have an active RGS Carbide license
- Internet connectivity is available but supply-chain security matters

**What's different:**
- Requires RGS Carbide portal access and registry credentials
- Images are signed with Cosign — signatures are verified at pull time
- FIPS-capable image builds available
- `modules/carbide/registry_auth.sh` must be run to configure registry credentials

**Carbide-specific prerequisites:**
- RGS Carbide portal account — request from the RGS Account Team
- `registry.ranchercarbide.dev` credentials stored in `~/.config/RGS.creds` on the admin node

---

## Enclave

Enclave extends Carbide into a true air-gap deployment. All artifacts are pre-synced from external sources into a local [Hauler](https://docs.hauler.dev) store on `nuc-00`, then served from there to all cluster nodes.

**Use when:**
- Simulating or demonstrating air-gapped Kubernetes operations
- FIPS compliance and data sovereignty are requirements
- You need to demonstrate that no workload reaches the internet for image pulls

**What's different:**
- Hauler must be run *before* deployment to populate the local artifact store
- A local Harbor registry is stood up inside the cluster to serve images
- The Harvester registry mirror configuration points to the local Harbor, not Docker Hub
- After initial provisioning, no node in the cluster requires outbound internet access

**Enclave-specific prerequisites:**
- All Carbide prerequisites (RGS portal access, credentials)
- Hauler binary installed on `nuc-00`
- Sufficient local storage for the artifact store (images + charts can be 20–50 GB)

**Enclave-specific steps (run before standard Day 1 scripts):**
1. `modules/enclave/hauler_sync.sh` — sync all required images and charts
2. `modules/enclave/harbor_setup.sh` — stand up the local Harbor registry

---

## How Environment Switching Works

All environment differences are contained in two places:

### 1. `Scripts/env.d/${ENVIRONMENT}.sh`

Variables that differ between environments — registry URLs, credentials, chart sources, domain names.

```bash
# Example: carbide.sh
export REGISTRY_URL="rgcrprod.azurecr.us"
export REGISTRY_USER="..."
export REGISTRY_TOKEN="..."
export BASE_DOMAIN="carbide.kubernerdes.com"
```

The common `Scripts/env.sh` sources this file automatically based on `$ENVIRONMENT`.

### 2. `Files/overrides/${ENVIRONMENT}/`

Configuration files that need to differ from the common baseline — for example, the Harvester registry mirror configuration that points to Harbor instead of Docker Hub in the Enclave environment.

Community has no overrides — it is the base layer. Carbide and Enclave layer their changes on top.

### Setting the environment

```bash
export ENVIRONMENT=community   # or carbide, enclave
source Scripts/env.sh
```

From this point forward, all scripts run in the context of the chosen environment. The numbered deploy scripts (`02_`, `10_`, `20_`, etc.) contain **no environment conditionals** — they simply read from `env.sh`.

Environment-specific *steps* (not just config values) live in `Scripts/modules/`. For example, the Enclave Hauler sync and Harbor setup are invoked explicitly from `modules/enclave/` rather than hidden inside a common script.
