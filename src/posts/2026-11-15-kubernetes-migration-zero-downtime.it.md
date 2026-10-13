---
layout: post.liquid
title: "Migrazione Kubernetes per applicazioni B2B legacy: playbook zero-downtime"
description: "Migrare un'applicazione B2B legacy su Kubernetes senza downtime è allo stesso tempo un problema di dati, traffico e osservabilità. Ecco il playbook che usiamo, passo dopo passo."
date: 2026-11-15
author: barannayir
tags: [devops-cicd-modernization, kubernetes-migration-strategy, zero-downtime-deployment, container-orchestration-legacy, statefulset-data-migration, kubernetes]
category: DevOps CI/CD Modernization
image: /assets/images/blog/2026-11-15-kubernetes-migration-zero-downtime.png
i18n_key: kubernetes-migration-zero-downtime
permalink: /it/blog/2026-11-15-kubernetes-migration-zero-downtime/
---

# Migrazione Kubernetes per B2B legacy: playbook zero-downtime

La maggior parte delle applicazioni B2B legacy gira su una sola VM, parla con un solo database e serve traffico tramite un load balancer che funziona da anni. Migrarne una verso Kubernetes — una piattaforma di orchestrazione di container che automatizza deployment, scaling e gestione delle applicazioni containerizzate — senza downtime è una sostituzione controllata di ogni pezzo, mentre il sistema continua a servire clienti paganti. Questo è il playbook che usiamo in ogni migrazione, passo dopo passo.

## 1. Perché le migrazioni big-bang falliscono

La tentazione è containerizzare l'app, puntare Kubernetes al database, commutare il load balancer, spedire. Le modalità di fallimento sono prevedibili: stringhe di connessione diverse in pod rischedulabili; un database ottimizzato per anni non sopravvive a un cambio improvviso nei pattern di connessione; lo stato di sessione in-memory scompare al primo riavvio; il rollback è indefinito perché il sistema legacy è già dismesso. L'alternativa è incrementale: sostituire una slice alla volta, mantenere il vecchio in parallelo.

## 2. Il pattern Strangler Fig

Un nuovo componente cresce attorno al vecchio, richiesta dopo richiesta, finché il legacy non ha più nulla da fare. Allestire un cluster mirror del legacy; mettere davanti un layer di routing — un ingress controller (NGINX, Traefik) o un service mesh (Istio, Linkerd) che instrada il traffico per path, header o cookie; scegliere una slice, tipicamente l'endpoint read-only a minor rischio, e instradare una piccola percentuale di traffico al nuovo servizio; osservare le metriche. Se reggono, espandere la slice. Se si rompono, il router rimanda al legacy. Lento di proposito: 5-10% degli endpoint al mese, cutover completo in 6-12 mesi.

## 3. Il layer dati: StatefulSets

La parte più difficile sono i dati. I servizi stateless si sostituiscono in giorni; i dati stateful richiedono settimane.

Le primitive: **StatefulSet** dà a ogni pod un'identità e uno storage stabili. **PersistentVolume (PV) e PersistentVolumeClaim (PVC)** sono lo strato di storage, supportato da un disco cloud o un driver CSI (Container Storage Interface — il plugin standard che Kubernetes usa per parlare con qualsiasi backend di storage). **Headless Service** è un Service senza IP di cluster che dà a ogni replica StatefulSet il proprio DNS.

La sequenza: **backfill** con mysqldump, pg_dump o un export vendor, poi verificare conteggi righe e checksum; **CDC** (Change Data Capture) via replica logica (Postgres logical decoding, MySQL binlog o Debezium); una **finestra dual-write** di meno di due settimane, con un job di riconciliazione che confronta entrambi i lati ogni notte; **cutover** che inverte il primary sul nuovo StatefulSet; **decommission** dopo una settimana di riconciliazione pulita. Reversibile a ogni passo fino al cutover finale.

## 4. Strategie di spostamento traffico

Tre strategie, in ordine di rischio. **Canary**: instradare 1-5% del traffico, mantenere 30-60 minuti, confrontare tasso di errore, latenza e KPI di business con la baseline, poi espandere a 10%, 25%, 50%, 100% se pulito. **Blue-Green**: mettere la nuova versione accanto alla vecchia, commutare il load balancer atomicamente, mantenere il vecchio ambiente caldo 24 ore per rollback istantaneo — costo maggiore, rischio minore al cutover. **Weighted routing** divide il traffico percentualmente via service mesh; utile per A/B testing, meno per le migrazioni. Usiamo canary per la maggior parte delle migrazioni, blue-green per il cutover finale.

## 5. Osservabilità: i quattro golden signals

Ogni nuovo servizio riceve gli stessi quattro signals prima di qualsiasi traffico: **Latency** (p50, p95, p99), **Traffic** (richieste al secondo per endpoint e tier), **Errors** (4xx e 5xx con errori business-level taggati), e **Saturation** (CPU, memoria, connection pool, database replica lag). Confrontare con la baseline legacy — il primo segnale di guai è di solito una piccola deriva nella latenza p99, non un picco di errori.

## 6. Il piano di rollback

Ogni passo ha bisogno di un percorso di rollback documentato prima di iniziare. Regola: qualsiasi passo che richiede più di 30 minuti per essere invertito è troppo rischioso. Il router rimanda il 100% del traffico al legacy in meno di un minuto; la finestra dual-write si ferma istantaneamente; il legacy resta caldo 30 giorni dopo il cutover; gli snapshot sono fatti prima e dopo ogni cutover e conservati 90 giorni. Se serve il rollback, eseguirlo senza esitazione — un rollback lento costa quasi sempre più di una migrazione ritardata.

## 7. Checklist pre-migrazione

Prima del primo canary: ambiente legacy documentato; cluster Kubernetes rispecchiato sulla rete legacy; migrazione dati StatefulSet provata su una copia di produzione; job di riconciliazione pulito per tre notti; quattro golden signals strumentati; procedura di rollback testata sotto i cinque minuti; rotazione on-call coperta; pagina di stato pronta.

## Conclusione

Una migrazione Kubernetes zero-downtime è una sequenza di piccoli passi reversibili, ciascuno custodito da dati, metriche e un rollback che è stato effettivamente testato. Strangler Fig, dati sincronizzati, spostamento di traffico pesato e osservabilità disciplinata producono una migrazione che i clienti non vedono mai. Vedi il nostro pillar [DevOps CI/CD Modernization](/it/devops-cicd-modernization/) per il contesto più ampio.