---
id: day-0
title: Day 0 — Design
sidebar_label: Overview
sidebar_position: 0
---

# Day 0 — Design

Design and planning decisions made before anything is installed.

Mistakes made on Day 0 are the most expensive to fix — a wrong IP scheme or an undersized network segment can require rebuilding from scratch. Take the time here.

## Day 0 Checklist

- [ ] Choose your environment (Community, Carbide, or Enclave)
- [ ] Acquire hardware — see [Hardware](./hardware.md)
- [ ] Plan your network — see [Network Planning](./network-planning.md)
- [ ] Understand environment differences — see [Environments](./environments.md)
- [ ] Verify prerequisites — see [Prerequisites](./prerequisites.md)

## Key Decisions

### Which environment?

| Environment | When to use |
|:-----------:|:------------|
| **Community** | First-time setup, exploring SUSE upstream tooling, no RGS license |
| **Carbide** | Demonstrating RGS hardened images, internet-connected lab |
| **Enclave** | Air-gapped scenarios, FIPS requirements, supply-chain security focus |

### Physical or virtual?

This documentation assumes Intel NUC hardware. The approach works on any x86-64 bare metal that supports PXE boot. Virtual deployment on a single large host is possible but not covered here.

## What You'll Have After Day 0

- Hardware procured and physically racked
- Network switch configured and cabled
- IP scheme documented
- DNS/DHCP plan finalized
- All software prerequisites downloaded or noted
- Environment chosen and `ENVIRONMENT` variable ready to set
