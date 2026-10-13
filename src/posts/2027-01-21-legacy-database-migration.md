---
layout: post.liquid
title: "Legacy Database Migration: 5 Strategies That Actually Work in Production"
description: "Big-bang database migrations fail. Here are 5 incremental strategies we have used on real production systems to move off legacy databases without downtime or data loss."
date: 2027-01-21
author: barannayir
tags: [database, migration, legacy, sql-server, postgres, strangler-fig]
category: Legacy Modernization
image: /assets/images/blog/2027-01-21-legacy-database-migration.png
i18n_key: legacy-database-migration
permalink: /blog/2027-01-21-legacy-database-migration/
---

# Legacy Database Migration: 5 Strategies That Actually Work in Production

Big-bang database migrations fail. The pattern is well known: a team plans a weekend cutover from SQL Server 2008 to PostgreSQL 16, the migration runs 4x slower than expected, the cutover slips to Monday, the rollback fails, and the company spends three months recovering. We have been hired to clean up these incidents many times.

This article is the five strategies we use instead. Each is incremental, has a defined rollback, and has been used in real [legacy modernization](/legacy-modernization/) engagements. The output is rarely a big-bang migration.

## Strategy 1: The Strangler Fig (Long-Term, Low Risk)

The strangler fig pattern, applied to databases: keep the legacy database running, route new writes to the new database, and migrate reads incrementally.

Implementation:
1. Stand up the new database (e.g. PostgreSQL 16) alongside the legacy one.
2. The application writes to both databases for a transition period (dual-write).
3. New features read from and write to the new database only.
4. Migrate old reads one service at a time, by changing the application's data access layer.
5. Once all reads are migrated, stop dual-writing.
6. Decommission the legacy database.

This is the right default. It is incremental, rollback is trivial (revert the data access layer), and the team learns the new database in production with low stakes. Most of our [legacy modernization work](/legacy-modernization/) follows this pattern.

The downside: it takes 12-18 months for a mid-sized system. Sometimes that is acceptable; sometimes it is not. If you have a forcing function (the legacy database is being decommissioned by the vendor), you may not have the time.

## Strategy 2: Parallel Run with Reconciliation (Medium-Term, Higher Risk)

Run both databases in parallel, but read from the legacy one. Periodically reconcile the new database against the legacy one to verify correctness. When reconciliation shows 100% match for a meaningful period (typically 30 days), cut over reads.

This strategy is right when:
- The legacy database is reliable but on an end-of-life platform
- You have the operational maturity to run reconciliation
- The application can tolerate dual writes without performance degradation

The reconciliation tooling is the hard part. Build it early. A simple row-count check is not enough — you need field-level reconciliation for at least the most critical tables (orders, customers, financial transactions).

We use this strategy for financial systems where correctness must be proven, not assumed. It takes 4-6 months for a mid-sized system.

## Strategy 3: Read Replica First (Quick Win, Limited Scope)

If the goal is to move reads off the legacy database (e.g. for reporting), start with read replicas of the new database, populated via change data capture (CDC) from the legacy one.

Tools: Debezium for CDC, Kafka for transport, PostgreSQL or Snowflake as the target.

This is the right first step for analytics workloads. Reporting queries stop competing with operational writes on the legacy system. The migration scope is limited (reads only), so the risk is low.

The limitation: you still need to migrate the writes eventually. This is a stepping stone, not a destination.

## Strategy 4: Schema-First Migration (Tactical, Specific)

For systems with a well-defined schema, a schema-first migration can be the right approach:
1. Define the target schema explicitly.
2. Write a one-time migration script with row-by-row transformation.
3. Test the migration script on production-size data.
4. Run during a maintenance window.
5. Cut over the application to the new database.

The right use case: small databases (< 50 GB), simple schemas, well-defined business rules, and a maintenance window the business can tolerate.

The wrong use case: large databases, complex schemas, or systems where 24/7 availability is required. We do not recommend schema-first for systems over 100 GB or with > 200 tables.

## Strategy 5: Buy Time With The Legacy System (When Migration Is The Wrong Answer)

Sometimes the right answer is to keep the legacy database. If the database works and the cost of migration exceeds the benefit, the migration is wrong.

We have seen teams spend €500k migrating a SQL Server 2008 system to PostgreSQL 16, when they could have paid €30k/year for an extended support contract and spent the migration budget on a new feature. The migration was politically motivated, not technically justified.

The honest test: if the legacy database is reliable, the data is sound, and the business does not have a forcing function, the migration is probably wrong. Spend the budget on [modernization work that pays back](/b2b-software-services/) instead.

## Choosing the Strategy

The right strategy depends on three factors:
- **Forcing function**: is there a deadline (vendor end-of-life, audit finding, infrastructure shutdown)?
- **System size**: how much data, how many tables, how many integration points?
- **Tolerance for risk**: can the business tolerate a multi-month parallel run, or is a faster cutover needed?

Most mid-market systems land in the strangler fig category. Some land in parallel run with reconciliation. A few land in schema-first. Almost none should be big-bang.

## Closing

The right database migration strategy is incremental, has a defined rollback, and is matched to the forcing function and system size. The big-bang approach fails in production; the incremental approaches succeed.

For the broader context of when database migration fits in a [legacy modernization program](/legacy-modernization/), and when to leave the system alone, see our overview. For the architecture decisions that often follow database migration, see [monolith vs microservices](/blog/2026-12-17-monolith-vs-microservices/).