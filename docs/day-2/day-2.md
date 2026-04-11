---
id: day-2
title: Day 2 — Operate
sidebar_label: Overview
sidebar_position: 0
---

# Day 2 — Operate

Ongoing health, security, and maintenance for the homelab.

## Day 2 Scripts

| Script | Purpose |
|:-------|:--------|
| `20_install_security.sh` | Deploy NeuVector on the applications cluster |
| `21_install_observability.sh` | Deploy SUSE Observability stack |
| `30_deploy_apps.sh` | Deploy sample workloads |
| `80_compare_images.sh` | Compare Community vs Carbide images side-by-side in NeuVector |

Run these against an active Rancher Manager instance:

```bash
export ENVIRONMENT=community   # ensure environment is set
source Scripts/env.sh
bash Scripts/20_install_security.sh
bash Scripts/21_install_observability.sh
bash Scripts/30_deploy_apps.sh
```

## Day 2 Topics

- [Environment Switching](./environment-switching.md) — switching between Community, Carbide, and Enclave
- [Monitoring](./monitoring.md) — keeping tabs on cluster health
- [Troubleshooting](./troubleshooting.md) — common issues and how to diagnose them
