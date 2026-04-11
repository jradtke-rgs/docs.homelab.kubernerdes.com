---
id: network-planning
title: Network Planning
sidebar_label: Network Planning
sidebar_position: 3
---

# Network Planning

IP addressing, DNS design, and network layout for all three environments.

## CIDRs

| Environment | CIDR | IP Prefix |
|:-----------:|:----:|:---------:|
| Community | 10.0.0.0/22 | 10.0.0 |
| Carbide | 10.10.12.0/22 | 10.10.12 |
| Enclave | 10.10.12.0/22 | 10.10.12 |

All IPs are derived from `${IP_PREFIX}` set in `Scripts/env.sh`. Carbide and Enclave share the same CIDR — they are never deployed simultaneously.

## IP Assignments

| Last Octet | Hostname | Purpose |
|:----------:|:---------|:--------|
| .1 | gateway | Default gateway / router |
| .8 | nuc-00-01 | DNS primary + DHCP + TFTP (infra VM on nuc-00) |
| .9 | nuc-00-02 | DNS secondary (infra VM on nuc-00) |
| .10 | nuc-00 | Admin host (Apache + KVM) |
| .12 | librenms | Network monitoring (VM, optional) |
| .93 | nuc-00-03 | HAProxy load balancer (infra VM on nuc-00) |
| .100 | harvester | Harvester cluster VIP |
| .101 | nuc-01 | Harvester node 1 |
| .102 | nuc-02 | Harvester node 2 |
| .103 | nuc-03 | Harvester node 3 |
| .111–.113 | nuc-0x-kvm | KVM copy IPs (reserved) |
| .193 | nuc-00-03-vip | HAProxy Keepalived VIP |
| .210 | rancher | Rancher Manager cluster VIP |
| .211–.213 | rancher-01/02/03 | Rancher Manager nodes |
| .220 | observability | Observability cluster VIP |
| .221–.223 | observability-01/02/03 | Observability nodes |
| .230 | apps | Applications cluster VIP |
| .231–.233 | apps-01/02/03 | Applications cluster nodes |
| .251 | spark-e | Optional hardware |
| .3.1–.3.254 | (dynamic) | DHCP pool (last /24 of the /22) |

Wildcard DNS: `*.apps.${ENVIRONMENT}.kubernerdes.com` → `${IP_PREFIX}.230`

## DNS Design

DNS is served by two BIND instances running as KVM VMs on `nuc-00`:

| Host | Role | IP |
|:-----|:-----|:---|
| nuc-00-01 | DNS primary, DHCP, TFTP | `${IP_PREFIX}.8` |
| nuc-00-02 | DNS secondary | `${IP_PREFIX}.9` |

The DNS zone covers `${BASE_DOMAIN}` (e.g., `community.kubernerdes.com`). All cluster hostnames, VIPs, and wildcard entries must resolve correctly before Harvester installation begins.

## HAProxy and Keepalived

HAProxy runs on `nuc-00-03` and provides load balancing for:

- Harvester API/UI — forward to `${IP_PREFIX}.101–103`
- Rancher Manager — forward to `${IP_PREFIX}.211–213`

Keepalived provides a VIP (`${IP_PREFIX}.193`) that floats between `nuc-00-03` and a standby, ensuring the load balancer survives a single-node failure.

## DHCP and PXE

ISC `dhcpd` on `nuc-00-01` handles:

- Static leases for all named hosts (bound by MAC address)
- Dynamic pool in the last `/24` of the `/22` for temporary/unknown hosts
- PXE boot coordination — when it detects the iPXE user-class in the DHCP request, it returns the iPXE menu URL instead of `ipxe.efi`

See [PXE Boot](../day-1/pxe-boot.md) for the full boot flow.

## Pre-Deployment Checklist

- [ ] Uplink internet access is available on port 16 of the switch
- [ ] All NUCs are cabled according to the switch layout in [Hardware](./hardware.md)
- [ ] Your router/gateway assigns `${IP_PREFIX}.1` as the default gateway
- [ ] No existing DHCP server is active on the network segment
- [ ] DNS for `${BASE_DOMAIN}` will be served by `nuc-00-01` (not delegated externally)
