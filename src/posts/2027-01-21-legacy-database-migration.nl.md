---
layout: post.liquid
title: "Legacy-databasemigratie: 5 strategieën die in productie daadwerkelijk werken"
description: "Big-bang databasemigraties mislukken. Hier zijn 5 incrementele strategieën die we op echte productiesystemen hebben gebruikt om van legacy-databases af te komen zonder downtime of dataverlies."
date: 2027-01-21
author: barannayir
tags: [database, migratie, legacy, sql-server, postgres, strangler-fig]
category: Legacy-modernisering
image: /assets/images/blog/2027-01-21-legacy-database-migration.png
i18n_key: legacy-database-migration
permalink: /nl/blog/2027-01-21-legacy-database-migration/
---

# Legacy-databasemigratie: 5 strategieën die in productie daadwerkelijk werken

Big-bang databasemigraties mislukken. Het patroon is goed bekend: een team plant een weekend-cutover van SQL Server 2008 naar PostgreSQL 16, de migratie draait 4x langzamer dan verwacht, de cutover schuift naar maandag, de rollback faalt, en het bedrijf is drie maanden bezig met herstel.

Dit artikel zijn de vijf strategieën die we in plaats daarvan gebruiken. Elke is incrementeel, heeft een gedefinieerde rollback, en is gebruikt in echte [legacy-moderniserings-](/nl/legacy-modernization/)opdrachten.

## Strategie 1: De strangler fig (lange termijn, laag risico)

Het strangler fig-patroon, toegepast op databases: houd de legacy-database draaien, routeer nieuwe schrijfacties naar de nieuwe database, en migreer leesacties incrementeel.

Implementatie:
1. Zet de nieuwe database (bijv. PostgreSQL 16) naast de legacy neer.
2. De applicatie schrijft tijdens een overgangsperiode naar beide databases (dual-write).
3. Nieuwe features lezen en schrijven alleen naar de nieuwe database.
4. Migreer oude leesacties één service tegelijk.
5. Zodra alle leesacties zijn gemigreerd, stop het dual-write.
6. Buiten gebruik stellen van de legacy-database.

De juiste standaard. Het is incrementeel, de rollback is triviaal, en het team leert de nieuwe database in productie met lage inzet. De keerzijde: het duurt 12-18 maanden voor een middelgroot systeem.

## Strategie 2: Parallelle uitvoering met reconciliatie (middellange termijn, hoger risico)

Draai beide databases parallel, maar lees van de legacy-database. Reconcileer periodiek de nieuwe database tegen de legacy om correctheid te verifiëren.

Deze strategie is juist wanneer:
- De legacy-database betrouwbaar is maar op een end-of-life platform draait
- U de operationele volwassenheid heeft om reconciliatie te draaien
- De applicatie dual-writes tolereert zonder prestatiedegradatie

We gebruiken deze strategie voor financiële systemen waar correctheid bewezen moet worden, niet aangenomen. Het duurt 4-6 maanden voor een middelgroot systeem.

## Strategie 3: Eerst read replica (snelle winst, beperkte reikwijdte)

Als het doel is om leesacties van de legacy-database af te krijgen (bijv. voor rapportage), begin dan met read replicas van de nieuwe database, gevuld via change data capture (CDC) van de legacy.

Tools: Debezium voor CDC, Kafka voor transport, PostgreSQL of Snowflake als doel.

De juiste eerste stap voor analytics-workloads. Reporting-query's concurreren niet meer met operationele schrijfacties. De migratieomvang is beperkt (alleen leesacties), dus het risico is laag.

## Strategie 4: Schema-first migratie (tactisch, specifiek)

Voor systemen met een goed gedefinieerd schema kan een schema-first migratie de juiste aanpak zijn:
1. Definieer het doelschema expliciet.
2. Schrijf een eenmalig migratiescript met rij-voor-rij transformatie.
3. Test het migratiescript op productiegrootte data.
4. Voer uit tijdens een onderhoudsvenster.
5. Schakel de applicatie over op de nieuwe database.

Juiste use case: kleine databases (< 50 GB), eenvoudige schema's, goed gedefinieerde bedrijfsregels.

Verkeerde use case: grote databases, complexe schema's, of systemen waar 24/7 beschikbaarheid vereist is.

## Strategie 5: Tijd kopen met het legacy-systeem (wanneer migratie het verkeerde antwoord is)

Soms is het juiste antwoord om de legacy-database te behouden. Als de database werkt en de kosten van migratie het voordeel overstijgen, is de migratie verkeerd.

We hebben teams 500 k € zien uitgeven aan het migreren van een SQL Server 2008-systeem naar PostgreSQL 16, terwijl ze 30 k €/jaar hadden kunnen betalen voor een extended support-contract en het migratiebudget hadden kunnen besteden aan een nieuwe feature. De migratie was politiek gemotiveerd, niet technisch gerechtvaardigd.

## De strategie kiezen

De juiste strategie hangt af van drie factoren:
- **Forcing function**: is er een deadline (vendor end-of-life, auditbevinding, infrastructuur-uitschakeling)?
- **Systeemgrootte**: hoeveel data, hoeveel tabellen, hoeveel integratiepunten?
- **Risicotolerantie**: kan het bedrijf een maandenlange parallelle uitvoering tolereren?

## Afsluiting

De juiste databasemigratiestrategie is incrementeel, heeft een gedefinieerde rollback, en is afgestemd op de forcing function en systeemgrootte. De big-bang-aanpak faalt in productie; de incrementele aanpakken slagen.

Voor de bredere context van wanneer databasemigratie past in een [legacy-moderniseringsprogramma](/nl/legacy-modernization/), en wanneer u het systeem met rust moet laten, zie ons overzicht. Voor de architectuurbeslissingen die vaak op databasemigratie volgen, zie [monoliet vs microservices](/nl/blog/2026-12-17-monolith-vs-microservices/).