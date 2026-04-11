---
id: infrastructure-vms
title: Infrastructure VMs
sidebar_label: Infrastructure VMs
sidebar_position: 2
---

# Infrastructure VMs

Three KVM virtual machines run on `nuc-00` and provide the foundational network services that the rest of the homelab depends on. These must be healthy before PXE booting the Harvester nodes.

## VMs Overview

| VM | IP | Services |
|:---|:---|:---------|
| nuc-00-01 | `${IP_PREFIX}.8` | BIND DNS primary, ISC dhcpd, TFTP |
| nuc-00-02 | `${IP_PREFIX}.9` | BIND DNS secondary |
| nuc-00-03 | `${IP_PREFIX}.93` | HAProxy, Keepalived |

## nuc-00-01 — DNS Primary, DHCP, TFTP

This is the most critical infrastructure VM. Every other node in the lab depends on it for IP addresses and name resolution.

### DHCP (`dhcpd`)

The DHCP configuration in `Files/nuc-00-01/etc/dhcpd.conf` handles:

- **Static leases** for all named hosts, bound by MAC address
- **Dynamic pool** in the last `/24` of the `/22` for temporary clients
- **PXE boot coordination** — when a DHCP request contains the iPXE user-class string, `dhcpd` returns the iPXE menu URL instead of `ipxe.efi`

```
# Excerpt — dhcpd.conf PXE logic
if exists user-class and option user-class = "iPXE" {
  filename "http://${ADMIN_IP}/harvester/harvester/ipxe-menu";
} else {
  next-server ${IP_PREFIX}.8;
  filename "ipxe.efi";
}
```

### DNS (`named`)

BIND serves the authoritative zone for `${BASE_DOMAIN}`. All cluster hostnames, VIPs, and the wildcard entry for workloads must be in this zone.

Critical records:
- `nuc-01.${BASE_DOMAIN}` → `${IP_PREFIX}.101`
- `harvester.${BASE_DOMAIN}` → `${IP_PREFIX}.100` (VIP)
- `rancher.${BASE_DOMAIN}` → `${IP_PREFIX}.210` (VIP)
- `*.apps.${BASE_DOMAIN}` → `${IP_PREFIX}.230` (wildcard for workloads)

### TFTP

`tftpd` serves `ipxe.efi` on UDP port 69. This is the initial binary that UEFI firmware downloads when PXE booting — before the iPXE client takes over and switches to HTTP.

## nuc-00-02 — DNS Secondary

A BIND secondary that receives zone transfers from `nuc-00-01`. Provides DNS redundancy — if `nuc-00-01` is temporarily unavailable, name resolution continues.

## nuc-00-03 — HAProxy + Keepalived

HAProxy distributes traffic across the Harvester API/UI and Rancher Manager endpoints.

### HAProxy backends

```
# Harvester cluster — distribute across all three nodes
frontend harvester_frontend
  bind *:443
  default_backend harvester_nodes

backend harvester_nodes
  balance roundrobin
  server nuc-01 ${IP_PREFIX}.101:443 check
  server nuc-02 ${IP_PREFIX}.102:443 check
  server nuc-03 ${IP_PREFIX}.103:443 check
```

### Keepalived VIP

Keepalived manages a virtual IP (`${IP_PREFIX}.193`) that floats between `nuc-00-03` and a standby instance. The VIP is what external clients and the Harvester/Rancher DNS entries point to — not the actual HAProxy host IP.

## Deployment Order

Deploy and verify in this order:

1. **nuc-00-01** — DHCP and DNS must be running before anything else boots
2. **nuc-00-02** — DNS secondary; verify zone transfer from nuc-00-01
3. **nuc-00-03** — HAProxy; can be deployed after DNS but before Harvester

## Verification

```bash
# DNS is resolving
dig @${IP_PREFIX}.8 nuc-01.${BASE_DOMAIN}

# DHCP is running on nuc-00-01
ssh ${IP_PREFIX}.8 systemctl is-active dhcpd

# HAProxy is running
ssh ${IP_PREFIX}.93 systemctl is-active haproxy

# Keepalived VIP is up
ping -c 1 ${IP_PREFIX}.193
```
