---
id: environment-switching
title: Environment Switching
sidebar_label: Environment Switching
sidebar_position: 1
---

# Environment Switching

The homelab's single-codebase design means switching between Community, Carbide, and Enclave is a matter of setting one variable and re-sourcing the config.

## Switching Environments

```bash
export ENVIRONMENT=carbide   # or community, enclave
source Scripts/env.sh
```

From this point, all scripts operate in the context of the chosen environment. No script modifications needed.

## What Changes Per Environment

### Variables (`Scripts/env.d/${ENVIRONMENT}.sh`)

| Variable | Community | Carbide | Enclave |
|:---------|:----------|:--------|:--------|
| `REGISTRY_URL` | docker.io | rgcrprod.azurecr.us | `${IP_PREFIX}.harbor` |
| `BASE_DOMAIN` | community.kubernerdes.com | carbide.kubernerdes.com | enclave.kubernerdes.com |
| `IP_PREFIX` | 10.0.0 | 10.10.12 | 10.10.12 |

### File Overrides (`Files/overrides/${ENVIRONMENT}/`)

Environment-specific configuration files are layered on top of the common `Files/` baseline:

- **Community** — no overrides (Community *is* the base)
- **Carbide** — Harvester registry mirror config pointing to `rgcrprod.azurecr.us`
- **Enclave** — Harvester registry mirror config pointing to local Harbor

## Community → Carbide

1. Obtain RGS Carbide portal credentials
2. Switch environment:
   ```bash
   export ENVIRONMENT=carbide
   source Scripts/env.sh
   ```
3. Configure registry auth:
   ```bash
   bash Scripts/modules/carbide/registry_auth.sh
   ```
4. Re-run `07_post_configure_harvester.sh` to update the Harvester registry mirror

## Carbide → Enclave

1. All Carbide prerequisites must be in place
2. Run Hauler sync to populate the local artifact store:
   ```bash
   bash Scripts/modules/enclave/hauler_sync.sh
   ```
3. Stand up Harbor:
   ```bash
   bash Scripts/modules/enclave/harbor_setup.sh
   ```
4. Switch environment:
   ```bash
   export ENVIRONMENT=enclave
   source Scripts/env.sh
   ```
5. Re-run `07_post_configure_harvester.sh` to update the registry mirror to local Harbor

## Image Comparison

After deploying NeuVector in both Community and Carbide, you can compare the image sets side-by-side:

```bash
bash Scripts/80_compare_images.sh
```

This script generates a comparison showing which images differ between Community (public registry) and Carbide (signed, FIPS-capable), useful for demonstrating supply-chain provenance.
