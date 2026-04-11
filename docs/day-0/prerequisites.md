---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
sidebar_position: 4
---

# Prerequisites

Software, credentials, and knowledge required before starting Day 1.

## Hardware Prerequisites

- 3× Intel NUC (or equivalent x86-64 hardware) for Harvester nodes — see [Hardware](./hardware.md)
- 1× Admin workstation / admin NUC (`nuc-00`)
- 16-port unmanaged switch
- Internet connectivity (Community and Carbide) or pre-synced Hauler store (Enclave)

## Software Prerequisites

### Admin Host (`nuc-00`)

- **openSUSE Leap** (or compatible SUSE Linux) installed on the admin host
- **KVM/libvirt** — for running infra VMs
- **Apache httpd** — for serving PXE artifacts and Harvester ISOs
- **TFTP server** — for serving `ipxe.efi` to UEFI clients
- **`envsubst`** — for rendering config templates (part of `gettext`)

```bash
# Install required packages on openSUSE Leap
sudo zypper install -y apache2 tftp qemu-kvm libvirt virt-install gettext-tools
sudo systemctl enable --now libvirtd apache2
```

### Workstation (for running scripts)

- **bash** — scripts target bash
- **kubectl** — for post-deploy verification
- **helm** — for Rancher Manager installation
- **`envsubst`** — for template rendering

### Carbide and Enclave — Additional Prerequisites

- RGS Carbide portal account and registry credentials
- **Cosign** — for image signature verification
- **Hauler** (Enclave only) — for artifact sync and local registry

## Harvester ISO

Download the Harvester installer and artifacts to `nuc-00` before PXE booting:

```bash
ISO_VERSION="${HARVESTER_VERSION}"
ISO_DIR=/srv/www/htdocs/harvester/${ISO_VERSION}
mkdir -p "${ISO_DIR}"

BASE=https://releases.rancher.com/harvester/${ISO_VERSION}
for f in \
  harvester-${ISO_VERSION}-amd64.iso \
  harvester-${ISO_VERSION}-vmlinuz-amd64 \
  harvester-${ISO_VERSION}-initrd-amd64 \
  harvester-${ISO_VERSION}-rootfs-amd64.squashfs
do
  wget -P "${ISO_DIR}" "${BASE}/${f}"
done
```

For Enclave, these files are pre-synced by `modules/enclave/hauler_sync.sh` and served from the local Hauler file server — no manual download needed.

## Knowledge Prerequisites

- Linux command line (SSH, `systemctl`, `journalctl`)
- Basic networking (subnets, VLANs, DNS, DHCP)
- YAML syntax
- Kubernetes basics (pods, deployments, services)
- KVM/libvirt virtualization concepts

For Carbide/Enclave: familiarity with container image signing (Cosign) is helpful.

## References

- [Harvester Releases](https://github.com/harvester/harvester/releases)
- [Rancher Manager — Helm CLI Quick Start](https://ranchermanager.docs.rancher.com/getting-started/quick-start-guides/deploy-rancher-manager/helm-cli)
- [RGS Carbide Portal](https://portal.ranchercarbide.dev/product/)
- [Hauler Documentation](https://docs.hauler.dev/docs/intro)
