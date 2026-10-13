---
layout: post.liquid
title: "Kubernetes Migration for Legacy B2B Apps: A Zero-Downtime Playbook"
description: "Migrating a legacy B2B application to Kubernetes without downtime is a data, traffic, and observability problem at once. Here is the playbook we use, step by step."
date: 2026-11-15
author: barannayir
tags: [devops-cicd-modernization, kubernetes-migration-strategy, zero-downtime-deployment, container-orchestration-legacy, statefulset-data-migration, kubernetes]
category: DevOps CI/CD Modernization
image: /assets/images/blog/2026-11-15-kubernetes-migration-zero-downtime.png
i18n_key: kubernetes-migration-zero-downtime
permalink: /blog/2026-11-15-kubernetes-migration-zero-downtime/
---

# Kubernetes Migration for Legacy B2B: Zero-Downtime Playbook

Most legacy B2B apps run on a single VM, talk to a single database, and serve traffic through a load balancer that has worked for years. Migrating one to Kubernetes — a container orchestration platform that automates deployment, scaling, and management of containerised applications — without downtime is a controlled replacement of every moving part while the system still serves paying customers. This is the playbook we use on [DevOps CI/CD modernization](/devops-cicd-modernization/).

## 1. Why Big-Bang Migrations Fail

The temptation is to containerise the app, point Kubernetes at the database, switch the load balancer, and ship. Failure modes are predictable: connection strings behave differently in reschedulable pods; a database tuned over years does not survive a sudden change in connection patterns; in-memory session state disappears on the first pod restart; rollback is undefined because the legacy system was already decommissioned. The alternative is incremental: replace one slice at a time, keep the old system running in parallel.

## 2. The Strangler Fig Pattern

A new component grows around the old one, request by request, until the legacy system has nothing left to do. Stand up a cluster mirroring legacy; put a routing layer in front of both — an ingress controller (NGINX, Traefik) or a service mesh (Istio, Linkerd) directing traffic by path, header, or cookie; pick one slice, typically the lowest-risk read-only endpoint, and route a small percentage of traffic to the new service; watch the metrics. If they hold, widen the slice. If they break, the router sends traffic back to legacy. The pattern is slow on purpose: 5-10% of endpoints per month, full cutover in 6-12 months.

## 3. The Data Layer: StatefulSets

The hardest part is the data. Stateless services can be replaced in days; stateful data takes weeks.

The primitives: **StatefulSet** gives each pod a stable identity and storage. **PersistentVolume (PV) and PersistentVolumeClaim (PVC)** are the storage layer, backed by a cloud disk or a CSI driver (Container Storage Interface — the standard plugin Kubernetes uses to talk to any storage backend). **Headless Service** is a Service without a cluster IP that gives each StatefulSet replica its own DNS.

The sequence: **backfill** with mysqldump, pg_dump, or a vendor export, then verify row counts and checksums; **CDC** (Change Data Capture) via logical replication (Postgres logical decoding, MySQL binlog, or Debezium); a **dual-write window** of under two weeks, with a reconciliation job comparing both sides nightly; **cutover** that flips the primary to the new StatefulSet; **decommission** only after reconciliation has been clean for a full week. Reversible at every step until the final cutover.

## 4. Traffic Shift Strategies

Three strategies, in order of risk. **Canary**: route 1-5% of traffic, hold 30-60 minutes, compare error rate, latency, and business KPIs against baseline, then expand to 10%, 25%, 50%, 100% if clean. **Blue-Green**: stand up the new version alongside the old, switch the load balancer atomically, keep the old environment warm for 24 hours for instant rollback — higher cost, lower risk at the cutover window. **Weighted routing** splits traffic by percentage via the service mesh; useful for A/B testing, less useful for migrations. We use canary for most migrations, blue-green for the final cutover.

## 5. Observability: The Four Golden Signals

Every new service gets the same four signals before any traffic hits it: **Latency** (p50, p95, p99), **Traffic** (requests per second by endpoint and tier), **Errors** (4xx and 5xx with business-level failures tagged), and **Saturation** (CPU, memory, connection pool, database replica lag). Compare against the legacy baseline — the first sign of trouble is usually a small drift in p99 latency, not an error spike.

## 6. The Rollback Plan

Every step needs a documented rollback path before it starts. Rule: any step that takes more than 30 minutes to reverse is too risky. The router returns 100% of traffic to legacy in under one minute; the dual-write window stops instantly; legacy stays warm for 30 days after cutover; database snapshots are taken before and after every cutover and held for 90 days. If rollback is needed, run it without hesitation — the cost of a slow rollback is almost always higher than the cost of a delayed migration.

## 7. Pre-Migration Checklist

Before the first canary: legacy environment documented; Kubernetes cluster mirrored to legacy network; StatefulSet data migration rehearsed on a production copy; reconciliation job clean for three nights; four golden signals instrumented; rollback procedure tested under five minutes; on-call rotation staffed; status page ready.

## Closing

A zero-downtime Kubernetes migration is a sequence of small, reversible steps, each guarded by data, metrics, and a rollback that has actually been tested. Strangler Fig, synchronised data, weighted traffic shifting, and disciplined observability produce a migration customers never see. See our [DevOps CI/CD modernization](/devops-cicd-modernization/) pillar for the broader context.