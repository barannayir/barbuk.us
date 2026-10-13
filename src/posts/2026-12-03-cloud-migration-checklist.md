---
layout: post.liquid
title: "Cloud Migration Checklist: 12 Things to Decide Before You Move a Single Server"
description: "Most cloud migrations go wrong in the planning phase. Here is the 12-item checklist we use before moving any production workload, derived from a decade of cloud projects."
date: 2026-12-03
author: barannayir
tags: [cloud-migration, aws, azure, kubernetes, checklist]
category: Cloud Migration
image: /assets/images/blog/2026-12-03-cloud-migration-checklist.png
i18n_key: cloud-migration-checklist
permalink: /blog/2026-12-03-cloud-migration-checklist/
---

# Cloud Migration Checklist: 12 Things to Decide Before You Move a Single Server

Most cloud migrations do not fail during the migration. They fail during the planning — when teams move workloads to the cloud that should have stayed on-prem, or move workloads without preserving the contracts their dependent systems depend on. By the time the cutover happens, the architecture is wrong and the migration is irreversible.

This article is the 12-item checklist we run before any [cloud migration project](/cloud-migration-services/). It is not a vendor methodology; it is the bare minimum that the migration will survive on.

## The Inventory

**1. Which workloads, in priority order.** Write them down. Rank by business criticality and migration risk. Do not migrate in alphabetical order. Do not migrate "easy wins" first to look productive — they teach you nothing and they consume the team's energy.

**2. Dependencies between workloads.** Application A talks to Application B which writes to Database C which is read by Reporting Tool D. Map it. Skipping this step is the single most common cause of cloud migration incidents.

**3. Data gravity.** Where does the data live today, how big is it, and what is the egress cost of moving it? A 50 TB database with high egress can blow the migration budget before it is halfway through.

## The Architecture Decisions

**4. Rehost, replatform, or refactor.** Be honest about which workloads deserve which. Rehost (lift-and-shift to VMs) is right for systems you plan to retire in 18 months. Replatform (small changes for cloud-native services) is the default. Refactor (rewrite for Kubernetes / microservices) is right for systems with multi-year runway.

**5. Kubernetes — yes or no.** Many workloads do not need Kubernetes. A simple web app on a managed container service, or even on a VM with autoscaling, is operationally simpler. Adopt Kubernetes only for systems with genuinely variable load or complex orchestration needs. We default to .NET on AKS or EKS for systems with long lifetimes.

**6. Single cloud, multi-cloud, or hybrid.** Multi-cloud is a marketing concept, not a strategy, unless you have a specific regulatory requirement. Hybrid is real and useful (cloud for stateless workloads, on-prem for legacy systems with compliance constraints). Pick one and commit.

## The Operations Decisions

**7. Identity and access.** Decide how identity is managed in the cloud — Azure AD / Entra ID, AWS IAM, or federation with your existing directory. Do this before any workload moves, because re-doing it is expensive.

**8. Networking topology.** Hub-and-spoke with a single VPC/VNet per environment, or full mesh, or isolated per workload? Hub-and-spoke is the right default for 90% of mid-market companies. Document the peering or VPN connections before you need them.

**9. Observability.** Logs, metrics, traces — where do they go, who can see them, how long are they retained? If you cannot answer this question, do not migrate anything. You will not be able to debug the migration.

## The Cost and Risk Decisions

**10. Cost model and ceiling.** Set a monthly cost ceiling per environment. Most companies discover their cloud bill is 30–50% higher than projected after migration, because of forgotten data transfer, idle resources, and managed-service premiums. A ceiling forces the conversation.

**11. Rollback plan.** For every workload, write down: how do we revert to on-prem if the cloud migration breaks in the first 30 days? If you cannot answer this, you do not have a migration plan, you have a gamble.

**12. Decommissioning plan for the source.** What happens to the on-prem server after cutover? If "we'll deal with it later" is the answer, you will pay for it twice for eighteen months.

## Closing

This checklist is the floor, not the ceiling. Every item is something we have either missed on a project (and paid for) or watched someone else miss (and then been hired to fix).

The most common pattern we see when fixing other people's migrations is the same set of failures: no inventory, no architecture decisions, no rollback plan, no decommissioning plan. Companies that work through this list before cutting over save themselves between €50k and €500k in recovery costs.

For the deeper architecture decisions around monolith vs. microservices — a related question many teams face in the cloud context — see our upcoming post in this series. For a closer look at the [legacy systems that drive most cloud migrations in the first place](/legacy-modernization/), see our recent piece on the hidden costs.