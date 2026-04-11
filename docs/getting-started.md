---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
sidebar_position: 1
---

# Getting Started

Welcome to the **Kubernerdes Homelab** documentation — a single-codebase deployment framework for building a Kubernetes lab using SUSE Rancher, Harvester, and related tooling on Intel NUC hardware.

## What You'll Build

A fully operational, on-premises Kubernetes platform consisting of:

- **4× Intel NUC** nodes — one admin/bootstrap host plus a 3-node Harvester hypervisor cluster
- **Harvester HCI** — open-source hyperconverged infrastructure for VMs and Kubernetes workloads
- **Rancher Manager** — multi-cluster management UI deployed on a 3-node K3s cluster inside Harvester
- **Infrastructure services** — ISC DHCP, BIND DNS, HAProxy load balancer, Keepalived VIP failover
- **Environment-specific layers** — Community (public registries), Carbide (RGS registry), or Enclave (air-gapped)

## Choose Your Environment

| Environment | Best For | Registry Source |
|:-----------:|:---------|:----------------|
| **Community** | Getting started, upstream SUSE tooling | Docker Hub / public registries |
| **Carbide** | RGS hardened images, internet-connected | `rgcrprod.azurecr.us` (RGS registry) |
| **Enclave** | Air-gapped operations, FIPS compliance | Local Harbor via Hauler |

Start with **Community** if you're new to the platform. Community is the base layer — Carbide and Enclave build on top of it.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│         Community: 10.0.0.0/22                              │
│         Carbide/Enclave: 10.10.12.0/22                      │
│                                                             │
│  nuc-00 (admin)          nuc-01/02/03 (Harvester cluster)   │
│  ┌──────────────────┐     ┌──────────────────────────────┐  │
│  │ KVM hypervisor   │     │  Harvester HCI               │  │
│  │                  │     │  VIP: ${IP_PREFIX}.100       │  │
│  │ ┌──────────────┐ │     │  ┌──────────────────────┐    │  │
│  │ │ nuc-00-01    │ │     │  │  rancher-01/02/03    │    │  │
│  │ │ DHCP + DNS   │ │     │  │  K3s HA cluster      │    │  │
│  │ └──────────────┘ │     │  │  VIP: ${IP_PREFIX}.210│   │  │
│  │ ┌──────────────┐ │     │  └──────────────────────┘    │  │
│  │ │ nuc-00-02    │ │     │                              │  │
│  │ │ DNS secondary│ │     │  .101 · .102 · .103          │  │
│  │ └──────────────┘ │     └──────────────────────────────┘  │
│  │ ┌──────────────┐ │                                       │
│  │ │ nuc-00-03    │ │                                       │
│  │ │ HAProxy +    │ │                                       │
│  │ │ Keepalived   │ │                                       │
│  │ └──────────────┘ │                                       │
│  │                  │                                       │
│  │ Apache + TFTP    │                                       │
│  │ (PXE server)     │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Day 0/1/2 Framework

| Phase | Focus | Where to Start |
|-------|-------|----------------|
| **Day 0** | Design & planning | [Day 0 Overview](./day-0/day-0.md) |
| **Day 1** | Initial deployment | [Day 1 Overview](./day-1/day-1.md) |
| **Day 2** | Ongoing operations | [Day 2 Overview](./day-2/day-2.md) |

## Prerequisites

Before diving in, you should be comfortable with:

- Linux command line (SSH, `systemctl`, `journalctl`)
- Basic networking concepts (subnets, VLANs, DNS, DHCP)
- YAML — for Kubernetes manifests and Harvester config
- Kubernetes basics (pods, deployments, services)
- KVM/libvirt virtualization concepts

For **Carbide** and **Enclave** environments, you'll also need:
- RGS Carbide portal access — request a license from the RGS Account Team
- Familiarity with container image signing and Cosign

## Source Repository

The automation and configuration source lives at:
[homelab.kubernerdes.com](https://github.com/jradtke-rgs/homelab.kubernerdes.com)

The repo contains shell scripts, Ansible playbooks, network config files, and Helm values files that implement everything described in this documentation.
