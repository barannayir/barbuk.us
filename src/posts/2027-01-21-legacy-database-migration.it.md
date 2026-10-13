---
layout: post.liquid
title: "Migrazione di database legacy: 5 strategie che funzionano davvero in produzione"
description: "Le migrazioni big-bang di database falliscono. Ecco 5 strategie incrementali che abbiamo usato su veri sistemi di produzione per uscire dai database legacy senza downtime o perdita di dati."
date: 2027-01-21
author: barannayir
tags: [database, migrazione, legacy, sql-server, postgres, strangler-fig]
category: Modernizzazione legacy
image: /assets/images/blog/2027-01-21-legacy-database-migration.png
i18n_key: legacy-database-migration
permalink: /it/blog/2027-01-21-legacy-database-migration/
---

# Migrazione di database legacy: 5 strategie che funzionano davvero in produzione

Le migrazioni big-bang di database falliscono. Il pattern è ben noto: un team pianifica un cutover nel fine settimana da SQL Server 2008 a PostgreSQL 16, la migrazione gira 4x più lentamente del previsto, il cutover slitta a lunedì, il rollback fallisce, e l'azienda passa tre mesi a recuperare.

Questo articolo sono le cinque strategie che usiamo invece. Ognuna è incrementale, ha un rollback definito, ed è stata usata in veri impegni di [modernizzazione legacy](/it/legacy-modernization/).

## Strategia 1: Lo strangler fig (lungo termine, basso rischio)

Il pattern strangler fig, applicato ai database: tenere in funzione il database legacy, instradare le nuove scritture verso il nuovo database, e migrare le letture in modo incrementale.

Implementazione:
1. Allestire il nuovo database (es. PostgreSQL 16) accanto al legacy.
2. L'applicazione scrive in entrambi i database per un periodo di transizione (dual-write).
3. Le nuove feature leggono e scrivono solo nel nuovo database.
4. Migrare le vecchie letture un servizio alla volta.
5. Una volta migrate tutte le letture, fermare il dual-write.
6. Dismettere il database legacy.

Il default giusto. È incrementale, il rollback è banale, e il team impara il nuovo database in produzione con posta in gioco bassa. Lo svantaggio: richiede 12-18 mesi per un sistema di medie dimensioni.

## Strategia 2: Esecuzione parallela con riconciliazione (medio termine, rischio più alto)

Far girare entrambi i database in parallelo, ma leggere dal database legacy. Riconciliare periodicamente il nuovo database contro il legacy per verificare la correttezza.

Questa strategia è giusta quando:
- Il database legacy è affidabile ma su una piattaforma a fine vita
- Avete la maturità operativa per eseguire la riconciliazione
- L'applicazione tollera dual-write senza degrado delle prestazioni

Usiamo questa strategia per sistemi finanziari dove la correttezza deve essere dimostrata, non assunta. Richiede 4-6 mesi per un sistema di medie dimensioni.

## Strategia 3: Read replica prima (vittoria rapida, portata limitata)

Se l'obiettivo è spostare le letture dal database legacy (es. per la reportistica), iniziare con read replica del nuovo database, popolate via change data capture (CDC) dal legacy.

Strumenti: Debezium per CDC, Kafka per il trasporto, PostgreSQL o Snowflake come destinazione.

Il giusto primo passo per i carichi analytics. Le query di reporting non competono più con le scritture operative. La portata della migrazione è limitata (solo letture), quindi il rischio è basso.

## Strategia 4: Migrazione schema-first (tattica, specifica)

Per sistemi con uno schema ben definito, una migrazione schema-first può essere l'approccio giusto:
1. Definire esplicitamente lo schema di destinazione.
2. Scrivere uno script di migrazione one-shot con trasformazione riga per riga.
3. Testare lo script su dati di dimensione produzione.
4. Eseguire durante una finestra di manutenzione.
5. Passare l'applicazione al nuovo database.

Caso d'uso giusto: database piccoli (< 50 GB), schemi semplici, regole di business ben definite.

Caso d'uso sbagliato: database grandi, schemi complessi, o sistemi dove è richiesta disponibilità 24/7.

## Strategia 5: Comprare tempo con il sistema legacy (quando la migrazione è la risposta sbagliata)

A volte la risposta giusta è mantenere il database legacy. Se il database funziona e il costo della migrazione supera il beneficio, la migrazione è sbagliata.

Abbiamo visto team spendere 500 k € per migrare un sistema SQL Server 2008 a PostgreSQL 16, quando avrebbero potuto pagare 30 k €/anno per un contratto di supporto esteso e spendere il budget di migrazione su una nuova feature. La migrazione era politicamente motivata, non tecnicamente giustificata.

## Scegliere la strategia

La strategia giusta dipende da tre fattori:
- **Forcing function**: c'è una scadenza (fine vita vendor, risultato di audit, spegnimento infrastruttura)?
- **Dimensione del sistema**: quanti dati, quante tabelle, quanti punti di integrazione?
- **Tolleranza al rischio**: l'azienda può tollerare un'esecuzione parallela di mesi?

## Conclusione

La giusta strategia di migrazione del database è incrementale, ha un rollback definito, ed è abbinata alla forcing function e alla dimensione del sistema. L'approccio big-bang fallisce in produzione; gli approcci incrementali riescono.

Per il contesto più ampio di quando la migrazione del database si inserisce in un [programma di modernizzazione legacy](/it/legacy-modernization/), e quando lasciare il sistema in pace, vedi la nostra panoramica. Per le decisioni di architettura che spesso seguono la migrazione del database, vedi [monolite vs microservizi](/it/blog/2026-12-17-monolith-vs-microservices/).