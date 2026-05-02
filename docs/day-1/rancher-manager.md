---
id: rancher-manager
title: Rancher Manager
sidebar_label: Rancher Manager
sidebar_position: 5
---

# Rancher Manager

Rancher Manager runs as a highly available 3-node RKE2 cluster. One VM is provisioned per Harvester node (on SL-Micro 6.1), ensuring Rancher survives the loss of any single physical NUC. A HAProxy instance on the admin host provides the load-balanced VIP.

## Architecture

```
Harvester Cluster (nuc-01, nuc-02, nuc-03)
  └─► 3 VMs (one per Harvester node, OS: SL-Micro 6.1)
        ├── rancher-01  ${IP_PREFIX}.211  RKE2 server (control-plane, etcd)
        ├── rancher-02  ${IP_PREFIX}.212  RKE2 server (control-plane, etcd)
        └── rancher-03  ${IP_PREFIX}.213  RKE2 server (control-plane, etcd)
              └─► HAProxy VIP: ${IP_PREFIX}.210  (hosted on admin node)
                    └─► rancher.${BASE_DOMAIN}
```

## Deployment

```bash
export ENVIRONMENT=carbide   # or community, enclave
bash Scripts/install_RKE2.sh          # run on each node
bash Scripts/10_install_rancher_manager.sh
```

`10_install_rancher_manager.sh` reads all chart sources, versions, and registry settings from `env.d/${ENVIRONMENT}.sh` — no manual edits required between environments.

## Prerequisites

- Harvester cluster healthy
- Three VMs provisioned and reachable as `rancher-01/02/03`
- DNS entry for `rancher.${BASE_DOMAIN}` pointing to `${IP_PREFIX}.210`
- HAProxy configured on the admin node for ports 80, 443, 6443, 9345
- **Carbide/Enclave only:** `Scripts/nuc-00/pull_sl_micro.sh` run to verify SL-Micro image and authenticate to the Carbide registry

## cert-manager

Installed first, from the jetstack OCI chart. Version is controlled by `CERTMGR_VERSION` in `env.d/${ENVIRONMENT}.sh`.

```bash
# What the script runs:
helm install cert-manager oci://quay.io/jetstack/charts/cert-manager \
  --namespace cert-manager --create-namespace \
  --version "${CERTMGR_VERSION}" \
  --set crds.enabled=true
```

Container images are automatically sourced from the configured registry (see [Environment-specific differences](#environment-specific-differences) below).

## Rancher Helm Values

| Value | Community | Carbide / Enclave |
|-------|-----------|-------------------|
| Chart repo | `releases.rancher.com/server-charts/latest` | `charts.rancher.com/server-charts/prime` |
| Chart name | `rancher-latest/rancher` | `rancher-prime/rancher` |
| `hostname` | `rancher.community.kubernerdes.com` | `rancher.carbide.kubernerdes.com` |
| `replicas` | 3 | 3 |
| `systemDefaultRegistry` | _(not set)_ | `registry.ranchercarbide.dev` |

`systemDefaultRegistry` tells Rancher to use the Carbide registry when deploying components into downstream clusters — complementing the `system-default-registry` already set in the RKE2 node config.

## Environment-specific differences

### Community

- Images pulled from public registries (Docker Hub, ghcr.io, etc.)
- No registry credentials required
- Rancher: `rancher-latest` chart channel

### Carbide

- RKE2 nodes configured with `system-default-registry: registry.ranchercarbide.dev`
- All container images (etcd, kube-apiserver, CNI, cert-manager, Rancher) are sourced from the Carbide registry
- Credentials for `registry.ranchercarbide.dev` stored in `~/.config/RGS.creds` on the admin node and written to `/etc/rancher/rke2/registries.yaml` on each node
- Rancher Prime chart (`rancher-prime` channel)

### Enclave

- All Carbide behavior, plus images are served from a local Harbor registry
- `system-default-registry` points to the local Harbor instance instead of the internet

## Post-Deploy Verification

```bash
export KUBECONFIG=~/.kube/${ENVIRONMENT}-rancher.kubeconfig

# All nodes Ready
kubectl get nodes -o wide

# cert-manager healthy
kubectl get pods -n cert-manager

# Rancher pods running
kubectl get pods -n cattle-system

# Rancher UI reachable
curl -sk https://rancher.${BASE_DOMAIN}/dashboard/ | grep -i rancher
```

## First Login

Browse to `https://rancher.${BASE_DOMAIN}` and set a new password. The bootstrap password is printed at the end of `10_install_rancher_manager.sh`, or retrieve it with:

```bash
kubectl get secret -n cattle-system bootstrap-secret \
  -o go-template='{{.data.bootstrapPassword|base64decode}}{{ "\n" }}'
```

## Next Steps

```bash
bash Scripts/20_install_security.sh      # NeuVector
bash Scripts/21_install_observability.sh # SUSE Observability
```
