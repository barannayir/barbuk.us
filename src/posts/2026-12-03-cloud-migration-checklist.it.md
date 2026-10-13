---
layout: post.liquid
title: "Checklist migrazione al cloud: 12 cose da decidere prima di spostare un solo server"
description: "La maggior parte delle migrazioni cloud fallisce in fase di pianificazione. Ecco la checklist in 12 punti che usiamo prima di qualsiasi migrazione di carichi produttivi."
date: 2026-12-03
author: barannayir
tags: [migrazione-cloud, aws, azure, kubernetes, checklist]
category: Migrazione al cloud
image: /assets/images/blog/2026-12-03-cloud-migration-checklist.png
i18n_key: cloud-migration-checklist
permalink: /it/blog/2026-12-03-cloud-migration-checklist/
---

# Checklist migrazione al cloud: 12 cose da decidere prima di spostare un solo server

La maggior parte delle migrazioni cloud non fallisce durante la migrazione. Fallisce durante la pianificazione — quando i team spostano carichi che sarebbero dovuti restare on-prem, o spostano carichi senza preservare i contratti da cui dipendono i sistemi a valle.

Questo articolo è la checklist in 12 punti che eseguiamo prima di ogni [progetto di migrazione al cloud](/it/cloud-migration-services/). Non è una metodologia vendor; è il minimo affinché la migrazione sopravviva.

## L'inventario

**1. Quali carichi, in ordine di priorità.** Elencateli. Ordinate per criticità di business e rischio di migrazione. Non migrate in ordine alfabetico.

**2. Dipendenze tra carichi.** L'applicazione A parla con l'applicazione B che scrive nel database C che è letto dallo strumento di reportistica D. Mappatelo. Saltare questo passo è la causa più comune di incidenti di migrazione cloud.

**3. Gravità dei dati.** Dove vivono i dati oggi, quanto sono grandi e qual è il costo di egress per spostarli?

## Le decisioni di architettura

**4. Rehost, replatform o refactor.** Siate onesti su cosa merita cosa. Rehost (lift-and-shift su VM) è giusto per sistemi che prevedete di dismettere in 18 mesi.

**5. Kubernetes — sì o no.** Molti carichi non hanno bisogno di Kubernetes. Adottate Kubernetes solo per sistemi con carico davvero variabile o complesse esigenze di orchestrazione. Noi puntiamo di default su .NET su AKS o EKS per sistemi a lunga vita.

**6. Single cloud, multi-cloud o hybrid.** Multi-cloud è un concetto di marketing, non una strategia, salvo un'esigenza normativa specifica.

## Le decisioni operative

**7. Identità e accesso.** Decidete come l'identità è gestita nel cloud — Azure AD / Entra ID, AWS IAM o federazione con la vostra directory esistente. Fatelo prima di qualsiasi spostamento di carichi.

**8. Topologia di rete.** Hub-and-spoke con un'unica VPC/VNet per ambiente, full mesh, o isolato per carico?

**9. Osservabilità.** Log, metriche, tracce — dove vanno, chi può vederli, per quanto sono conservati? Se non potete rispondere, non migrate nulla.

## Le decisioni di costo e rischio

**10. Modello di costo e tetto.** Fissate un tetto mensile per ambiente. La maggior parte scopre che la fattura cloud è 30–50% più alta del previsto.

**11. Piano di rollback.** Per ogni carico, scrivete: come torniamo on-prem nei primi 30 giorni se la migrazione cloud si rompe?

**12. Piano di dismissione della sorgente.** Cosa succede al server on-prem dopo il cutover?

## Conclusione

Questa checklist è il pavimento, non il soffitto. Ogni punto è qualcosa che abbiamo mancato su un progetto (e pagato) o visto mancare a qualcun altro.

Il pattern più comune nel riparare le migrazioni altrui è lo stesso insieme di errori. Le aziende che attraversano questa lista prima del cutover risparmiano tra 50 k € e 500 k € in costi di ripristino.

Per le decisioni di architettura più profonde su monolite vs microservizi — una domanda correlata che molti team si trovano ad affrontare nel contesto cloud — vedi il nostro prossimo articolo in questa serie. Per uno sguardo più ravvicinato ai [sistemi legacy che guidano la maggior parte delle migrazioni cloud](/it/legacy-modernization/), vedi il nostro recente pezzo sui costi nascosti.