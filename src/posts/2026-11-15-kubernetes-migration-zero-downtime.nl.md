---
layout: post.liquid
title: "Kubernetes-migratie voor legacy B2B-applicaties: zero-downtime playbook"
description: "Een legacy B2B-applicatie zonder downtime naar Kubernetes migreren is tegelijk een data-, verkeers- en observability-probleem. Hier is het playbook dat wij stap voor stap gebruiken."
date: 2026-11-15
author: barannayir
tags: [devops-cicd-modernization, kubernetes-migration-strategy, zero-downtime-deployment, container-orchestration-legacy, statefulset-data-migration, kubernetes]
category: DevOps CI/CD Modernization
image: /assets/images/blog/2026-11-15-kubernetes-migration-zero-downtime.png
i18n_key: kubernetes-migration-zero-downtime
permalink: /nl/blog/2026-11-15-kubernetes-migration-zero-downtime/
---

# Kubernetes-migratie voor legacy B2B: zero-downtime playbook

De meeste legacy B2B-applicaties draaien op één VM, praten met één database en bedienen verkeer via een load balancer die al jaren werkt. Een daarvan naar Kubernetes migreren — een container-orchestration platform dat deployment, schaling en beheer van gecontaineriseerde applicaties automatiseert — zonder downtime is een gecontroleerde vervanging van elk bewegend onderdeel, terwijl het systeem blijft betalende klanten bedienen. Dit is het playbook dat we gebruiken op [DevOps CI/CD Modernization](/nl/devops-cicd-modernization/) projecten.

## 1. Waarom big-bang-migraties falen

De verleiding is om de app te containeriseren, Kubernetes naar de database te laten wijzen, de load balancer om te schakelen, en te shippen. Faalmodi zijn voorspelbaar: verbindingsreeksen gedragen zich anders in rescheduleable pods; een database die jaren is getuned overleeft geen plotselinge verandering in verbindingspatronen; in-memory sessiestatus verdwijnt bij de eerste pod-herstart; rollback is ongedefinieerd omdat het legacy-systeem al is uitgefaseerd. Het alternatief is incrementeel: vervang één slice tegelijk, houd het oude systeem parallel draaiende.

## 2. Het Strangler Fig-patroon

Een nieuwe component groeit rond de oude, verzoek na verzoek, tot het legacy-systeem niets meer te doen heeft. Zet een cluster op dat het legacy spiegelt; plaats een routing-laag voor beide — een ingress controller (NGINX, Traefik) of een service mesh (Istio, Linkerd) die verkeer routeert op pad, header of cookie; kies één slice, typisch de read-only endpoint met het laagste risico, en routeer een klein percentage van het verkeer naar de nieuwe service; observeer de metrics. Houden ze stand, verbreed de slice. Breken ze, stuurt de router het verkeer terug naar legacy. Het patroon is bewust langzaam: 5-10% van de endpoints per maand, volledige cutover in 6-12 maanden.

## 3. De datalaag: StatefulSets

Het moeilijkste deel zijn de data. Stateless services kunnen in dagen worden vervangen; stateful data duurt weken.

De primitives: **StatefulSet** geeft elke pod een stabiele identiteit en opslag. **PersistentVolume (PV) en PersistentVolumeClaim (PVC)** zijn de opslaglaag, ondersteund door een cloud-schijf of een CSI-driver (Container Storage Interface — de standaard plug-in die Kubernetes gebruikt om met elke storage-backend te praten). **Headless Service** is een Service zonder cluster-IP die elke StatefulSet-replica een eigen DNS geeft.

De volgorde: **backfill** met mysqldump, pg_dump of een vendor-export, verifieer dan rijtellingen en checksums; **CDC** (Change Data Capture) via logische replicatie (Postgres logical decoding, MySQL binlog, of Debezium); een **dual-write venster** van minder dan twee weken, met een reconciliation-job die beide zijden 's nachts vergelijkt; **cutover** die de primary naar de nieuwe StatefulSet schakelt; **decommission** pas nadat reconciliation een volle week schoon is. Op elke stap omkeerbaar tot aan de finale cutover.

## 4. Traffic-shiftstrategieën

Drie strategieën, op volgorde van risico. **Canary**: routeer 1-5% van het verkeer, houd 30-60 minuten vast, vergelijk foutpercentage, latentie en business-KPIs met baseline, breid dan uit naar 10%, 25%, 50%, 100% indien schoon. **Blue-Green**: zet de nieuwe versie naast de oude, schakel de load balancer atomair om, houd de oude omgeving 24 uur warm voor directe rollback — hogere kosten, lager risico bij het cutover-venster. **Weighted routing** splitst verkeer procentueel via de service mesh; nuttig voor A/B-testing, minder nuttig voor migraties. We gebruiken canary voor de meeste migraties, blue-green voor de finale cutover.

## 5. Observability: de vier golden signals

Elke nieuwe service krijgt voor het eerste verkeer dezelfde vier signals: **Latency** (p50, p95, p99), **Traffic** (requests per seconde per endpoint en tier), **Errors** (4xx en 5xx met business-level fouten getagd), en **Saturation** (CPU, geheugen, connection pool, database replica lag). Vergelijk met de legacy-baseline — het eerste teken van problemen is meestal een kleine drift in p99-latentie, geen foutpiek.

## 6. Het rollback-plan

Elke stap heeft een gedocumenteerd rollback-pad nodig voordat deze begint. Regel: elke stap die meer dan 30 minuten nodig heeft om te keren, is te riskant. De router stuurt 100% van het verkeer in minder dan één minuut terug naar legacy; het dual-write venster stopt direct; legacy blijft 30 dagen na cutover warm; database-snapshots worden voor en na elke cutover gemaakt en 90 dagen bewaard. Als rollback nodig is, voer het uit zonder aarzeling — de kosten van een langzame rollback zijn bijna altijd hoger dan de kosten van een vertraagde migratie.

## 7. Pre-migratiechecklist

Vóór de eerste canary: legacy-omgeving gedocumenteerd; Kubernetes-cluster gespiegeld aan legacy-netwerk; StatefulSet-datamigratie gerepeteerd op een productie-kopie; reconciliation-job drie nachten schoon; vier golden signals geïnstrumenteerd; rollback-procedure getest onder vijf minuten; on-call rotatie bemand; statuspagina gereed.

## Afsluiting

Een zero-downtime Kubernetes-migratie is een reeks kleine, omkeerbare stappen, elk bewaakt door data, metrics en een rollback die daadwerkelijk getest is. Strangler Fig, gesynchroniseerde data, gewogen traffic-shifting en gedisciplineerde observability produceren een migratie die klanten nooit zien. Zie onze [DevOps CI/CD Modernization](/nl/devops-cicd-modernization/) pilaar voor de bredere context.