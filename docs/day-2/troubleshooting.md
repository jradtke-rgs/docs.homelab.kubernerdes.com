---
id: troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
sidebar_position: 3
---

# Troubleshooting

Common issues and diagnostic steps.

## PXE Boot Issues

### Node doesn't get an IP

1. Check DHCP is running on `nuc-00-01`:
   ```bash
   ssh ${IP_PREFIX}.8 systemctl status dhcpd
   ```
2. Verify the MAC address in `dhcpd.conf` matches the actual NIC MAC
3. Check that no other DHCP server is active on the network segment

### iPXE menu doesn't appear (node boots from disk)

1. Verify TFTP is serving `ipxe.efi`:
   ```bash
   tftp ${IP_PREFIX}.8 -c get ipxe.efi /tmp/test.efi && echo OK
   ```
2. Check the DHCP `next-server` and `filename` options in `dhcpd.conf`
3. Verify Apache is serving the iPXE menu:
   ```bash
   curl http://${IP_PREFIX}.10/harvester/harvester/ipxe-menu
   ```

### Harvester install stalls

1. Check that all config YAML files are rendered (no `${VAR}` placeholders remain):
   ```bash
   grep '\${' /srv/www/htdocs/harvester/harvester/config-create-nuc-01.yaml
   ```
2. Verify DNS resolves the Harvester VIP before second/third node joins
3. Check Harvester installer logs on the console

## DNS Issues

### Cluster nodes can't resolve hostnames

1. Verify BIND is running:
   ```bash
   ssh ${IP_PREFIX}.8 systemctl status named
   ```
2. Test resolution from a cluster node:
   ```bash
   dig @${IP_PREFIX}.8 rancher.${BASE_DOMAIN}
   ```
3. Check that `nuc-00-01` is the first DNS server in `/etc/resolv.conf` on each node

## Rancher Manager Issues

### Rancher UI unreachable

1. Check the Keepalived VIP is up:
   ```bash
   ping -c 1 ${IP_PREFIX}.193
   ```
2. Check HAProxy is forwarding to Rancher VMs:
   ```bash
   ssh ${IP_PREFIX}.93 systemctl status haproxy
   ```
3. Verify Rancher K3s VMs are running inside Harvester

### `cert-manager` webhook failures

Wait 2–3 minutes after cert-manager install before running the Rancher Helm chart. The webhook needs time to become ready.

```bash
kubectl --kubeconfig ~/.kube/rancher.yaml -n cert-manager wait \
  --for=condition=ready pod --selector=app.kubernetes.io/component=webhook \
  --timeout=120s
```

## Environment / Registry Issues

### Image pull failures (Carbide/Enclave)

1. Verify registry credentials are correct:
   ```bash
   bash Scripts/modules/carbide/registry_auth.sh
   ```
2. Check Harvester registry mirror configuration:
   ```bash
   kubectl --kubeconfig ~/.kube/harvester.yaml get configmap -n harvester-system
   ```
3. For Enclave: verify the Hauler store is populated and Harbor is running

### `envsubst` leaves `${VAR}` placeholders

Ensure the environment is sourced before running scripts:
```bash
source Scripts/env.sh
echo $BASE_DOMAIN   # should print the domain, not "${BASE_DOMAIN}"
```

## General Diagnostic Commands

```bash
# Check all pods across all namespaces
kubectl --kubeconfig ~/.kube/harvester.yaml get pods -A | grep -v Running

# Recent events (errors first)
kubectl --kubeconfig ~/.kube/harvester.yaml get events -A --sort-by='.lastTimestamp' | tail -20

# Harvester node logs
kubectl --kubeconfig ~/.kube/harvester.yaml logs -n harvester-system -l app=harvester --tail=50

# Check cluster etcd health
kubectl --kubeconfig ~/.kube/harvester.yaml -n kube-system exec -it \
  $(kubectl --kubeconfig ~/.kube/harvester.yaml get pods -n kube-system -l component=etcd -o name | head -1) \
  -- etcdctl endpoint health
```
