---
id: monitoring
title: Monitoring
sidebar_label: Monitoring
sidebar_position: 2
---

# Monitoring

Observability and health monitoring for the homelab.

## SUSE Observability

Deploy the SUSE Observability stack:

```bash
bash Scripts/21_install_observability.sh
```

This deploys the observability components onto the observability cluster (`${IP_PREFIX}.220–223`), which runs as VMs inside Harvester.

## Harvester Cluster Health

```bash
# Node status
kubectl --kubeconfig ~/.kube/harvester.yaml get nodes

# Longhorn storage health
kubectl --kubeconfig ~/.kube/harvester.yaml -n longhorn-system get pods

# Check for any nodes Not Ready
kubectl --kubeconfig ~/.kube/harvester.yaml get nodes | grep -v Ready
```

## Rancher Manager Health

```bash
# Rancher pods
kubectl --kubeconfig ~/.kube/rancher.yaml -n cattle-system get pods

# Check Rancher is reachable
curl -sk https://rancher.${BASE_DOMAIN}/ping
```

## Infrastructure Services

```bash
# DNS resolution
dig @${IP_PREFIX}.8 harvester.${BASE_DOMAIN}
dig @${IP_PREFIX}.8 rancher.${BASE_DOMAIN}

# HAProxy stats (if enabled)
curl http://${IP_PREFIX}.93:9000/stats

# DHCP leases
ssh ${IP_PREFIX}.8 cat /var/lib/dhcp/dhcpd.leases
```

## NeuVector

After deploying `20_install_security.sh`, NeuVector is accessible via the Rancher UI under **Security** → **NeuVector**, or directly at its ingress URL.

Key things to monitor in NeuVector:
- Network connections graph — baseline normal traffic
- CVE scan results — check for critical vulnerabilities in running containers
- Policy mode — start in Monitor mode before switching to Protect
