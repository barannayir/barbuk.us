---
layout: post.liquid
title: "Legacy-Datenbank-Migration: 5 Strategien, die in der Produktion tatsächlich funktionieren"
description: "Big-Bang-Datenbankmigrationen scheitern. Hier sind 5 inkrementelle Strategien, die wir in echten Produktionssystemen verwendet haben, um Legacy-Datenbanken ohne Ausfallzeit oder Datenverlust abzulösen."
date: 2027-01-21
author: barannayir
tags: [datenbank, migration, legacy, sql-server, postgres, strangler-fig]
category: Legacy-Modernisierung
image: /assets/images/blog/2027-01-21-legacy-database-migration.png
i18n_key: legacy-database-migration
permalink: /de/blog/2027-01-21-legacy-database-migration/
---

# Legacy-Datenbank-Migration: 5 Strategien, die in der Produktion tatsächlich funktionieren

Big-Bang-Datenbankmigrationen scheitern. Das Muster ist bekannt: Ein Team plant ein Wochenende-Cutover von SQL Server 2008 auf PostgreSQL 16, die Migration läuft 4x langsamer als erwartet, das Cutover verschiebt sich auf Montag, der Rollback schlägt fehl, und das Unternehmen verbringt drei Monate mit der Wiederherstellung.

Dieser Artikel sind die fünf Strategien, die wir stattdessen verwenden. Jede ist inkrementell, hat einen definierten Rollback, und wurde in echten [Legacy-Modernisierungs-](/de/legacy-modernization/)Engagements verwendet.

## Strategie 1: Die Würgefeige (langfristig, geringes Risiko)

Das Strangler-Fig-Muster, angewendet auf Datenbanken: Legacy-DB laufen lassen, neue Schreibvorgänge an die neue DB routen, und Lesevorgänge inkrementell migrieren.

Implementierung:
1. Neue DB (z. B. PostgreSQL 16) neben der Legacy-DB aufsetzen.
2. Anwendung schreibt während Übergangsphase in beide DBs (Dual-Write).
3. Neue Features lesen und schreiben nur in die neue DB.
4. Alte Lesevorgänge Dienst nach Dienst migrieren.
5. Sobald alle Lesevorgänge migriert sind, Dual-Write stoppen.
6. Legacy-DB außer Betrieb nehmen.

Die richtige Standardwahl. Sie ist inkrementell, der Rollback ist trivial, und das Team lernt die neue DB in der Produktion mit niedrigem Einsatz. Der Nachteil: Sie dauert 12-18 Monate für ein mittelgroßes System.

## Strategie 2: Parallelbetrieb mit Abgleich (mittelfristig, höheres Risiko)

Beide DBs parallel betreiben, aber aus der Legacy-DB lesen. Periodisch die neue DB gegen die Legacy-DB abgleichen, um Korrektheit zu verifizieren.

Diese Strategie ist richtig, wenn:
- Die Legacy-DB zuverlässig ist, aber auf einer End-of-Life-Plattform
- Sie die operative Reife haben, um Abgleich zu betreiben
- Die Anwendung Dual-Writes ohne Performance-Degradation verträgt

Wir verwenden diese Strategie für Finanzsysteme, bei denen Korrektheit bewiesen, nicht angenommen werden muss. Sie dauert 4-6 Monate für ein mittelgroßes System.

## Strategie 3: Read Replica zuerst (schneller Gewinn, begrenzter Umfang)

Wenn das Ziel darin besteht, Lesevorgänge von der Legacy-DB zu verlagern (z. B. für Reporting), beginnen Sie mit Read Replicas der neuen DB, befüllt via Change Data Capture (CDC) von der Legacy-DB.

Werkzeuge: Debezium für CDC, Kafka für den Transport, PostgreSQL oder Snowflake als Ziel.

Die richtige erster Schritt für Analytics-Workloads. Reporting-Abfragen konkurrieren nicht mehr mit operativen Schreibvorgängen. Der Migrationsumfang ist begrenzt (nur Lesevorgänge), also ist das Risiko gering.

## Strategie 4: Schema-First-Migration (taktisch, spezifisch)

Für Systeme mit einem klar definierten Schema kann eine Schema-First-Migration der richtige Ansatz sein:
1. Zielschema explizit definieren.
2. Einmaliges Migrationsskript mit zeilenweiser Transformation schreiben.
3. Migrationsskript auf produktionsgroßen Daten testen.
4. Während eines Wartungsfensters ausführen.
5. Anwendung auf die neue DB umstellen.

Richtiger Anwendungsfall: kleine Datenbanken (< 50 GB), einfache Schemata, klar definierte Geschäftsregeln.

Falscher Anwendungsfall: große Datenbanken, komplexe Schemata oder Systeme, bei denen 24/7-Verfügbarkeit erforderlich ist.

## Strategie 5: Zeit mit dem Legacy-System kaufen (wenn Migration die falsche Antwort ist)

Manchmal ist die richtige Antwort, die Legacy-DB zu behalten. Wenn die DB funktioniert und die Migrationskosten den Nutzen übersteigen, ist die Migration falsch.

Wir haben Teams gesehen, die 500.000 € für die Migration eines SQL Server 2008-Systems auf PostgreSQL 16 ausgegeben haben, als sie 30.000 €/Jahr für einen Extended-Support-Vertrag hätten zahlen und das Migrationsbudget für ein neues Feature hätten ausgeben können. Die Migration war politisch motiviert, nicht technisch gerechtfertigt.

## Wahl der Strategie

Die richtige Strategie hängt von drei Faktoren ab:
- **Forcing Function**: gibt es eine Frist (Vendor-End-of-Life, Audit-Findung, Infrastruktur-Abschaltung)?
- **Systemgröße**: wie viele Daten, wie viele Tabellen, wie viele Integrationspunkte?
- **Risikotoleranz**: kann das Unternehmen einen mehrmonatigen Parallelbetrieb tolerieren?

## Abschluss

Die richtige Datenbank-Migrationsstrategie ist inkrementell, hat einen definierten Rollback und ist auf die Forcing Function und Systemgröße abgestimmt. Der Big-Bang-Ansatz scheitert in der Produktion; die inkrementellen Ansätze gelingen.

Für den breiteren Kontext, wann eine Datenbankmigration in ein [Legacy-Modernisierungsprogramm](/de/legacy-modernization/) passt, und wann das System in Ruhe gelassen werden sollte, siehe unsere Übersicht. Für die Architekturentscheidungen, die oft auf eine Datenbankmigration folgen, siehe [Monolith vs Microservices](/de/blog/2026-12-17-monolith-vs-microservices/).