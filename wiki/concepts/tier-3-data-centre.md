---
title: "Tier-3 Data Centre Standard"
tags: [concept, tier-classification, uptime, redundancy, hyperscale]
updated: "2025-01-19"
source: "cockpit_event"
---

# Tier-3 Data Centre Standard

## Definition

**Tier-3** is an Uptime Institute classification representing **concurrently maintainable** data centre infrastructure with **99.982% uptime** (1.6 hours annual downtime).

## Key Characteristics

### Redundancy Requirements
- **N+1 redundancy** for all critical systems
- Dual-powered equipment with independent distribution paths
- **One active path** and one alternate path for maintenance

### Operational Capabilities
- Maintenance without shutdowns
- Protection against unplanned outages from single component failures
- Planned work can occur during operational hours

## Relevance to Hyperscale

For [[Hyperscale Data Centre]] projects like [[Mytrah Group]]'s 300 MW target, **Tier-3** provides:
- Enterprise-grade reliability without Tier-4 cost premiums
- Suitable for cloud and colocation workloads
- Alignment with most hyperscaler uptime SLAs

## Design Implications

- **Power**: 2N UPS, N+1 generators, dual utility feeds
- **Cooling**: N+1 CRAC/CRAH units, redundant chillers
- **Network**: Diverse fiber entry points, redundant routing

## Cross-References

- [[Tier Classification Framework]]
- [[Greenfield Infrastructure Design]]
- [[Uptime vs Cost Trade-offs]]
