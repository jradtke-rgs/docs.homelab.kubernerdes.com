---
id: rancher-manager
title: Rancher Manager
sidebar_label: Rancher Manager
sidebar_position: 5
---

# Rancher Manager

Rancher Manager runs as a highly available K3s cluster inside Harvester. Three VMs — one per Harvester node — are provisioned via Harvester's VM API, then K3s and Rancher are deployed via Helm.

## Architecture

```
Harvester Cluster (nuc-01, nuc-02, nuc-03)
  └─► 3 VMs (one per Harvester node)
        ├── rancher-01  ${IP_PREFIX}.211  K3s server
        ├── rancher-02  ${IP_PREFIX}.212  K3s server
        └── rancher-03  ${IP_PREFIX}.213  K3s server
              └─► Keepalived VIP: ${IP_PREFIX}.210
                    └─► rancher.${BASE_DOMAIN}
```

Placing one VM per Harvester node means Rancher Manager survives the loss of any single physical NUC.

## Deployment

```bash
bash Scripts/10_install_rancher_manager.sh
```

The script:
1. Provisions three VMs inside Harvester using cloud-init
2. Installs K3s on each VM (HA mode using the embedded etcd)
3. Installs `cert-manager` via Helm
4. Installs Rancher Manager via Helm using the CA-signed TLS certificate

## Prerequisites

- Harvester cluster is healthy and `07_post_configure_harvester.sh` has been run
- Root CA is in place
- DNS entries for `rancher.${BASE_DOMAIN}` and `${IP_PREFIX}.210–213` resolve correctly

## Helm Values

Key Helm values set by the install script:

```yaml
hostname: rancher.${BASE_DOMAIN}
replicas: 3
ingress:
  tls:
    source: secret
privateCA: true
```

The `privateCA: true` flag tells Rancher to trust your internal root CA.

## Post-Deploy Verification

```bash
# Rancher UI should respond
curl -sk https://rancher.${BASE_DOMAIN}/dashboard/ | grep -i rancher

# All K3s nodes should be Ready
kubectl --kubeconfig ~/.kube/rancher.yaml get nodes

# Rancher pods should be Running
kubectl --kubeconfig ~/.kube/rancher.yaml -n cattle-system get pods
```

## Next Steps (Day 2)

With Rancher Manager running, you can proceed to Day 2 workloads:

```bash
bash Scripts/20_install_security.sh      # NeuVector
bash Scripts/21_install_observability.sh # SUSE Observability
bash Scripts/30_deploy_apps.sh           # Sample workloads
```
