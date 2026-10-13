---
layout: post.liquid
title: "Kubernetes-Migration für Legacy-B2B-Anwendungen: Zero-Downtime-Playbook"
description: "Eine Legacy-B2B-Anwendung ohne Ausfallzeit nach Kubernetes zu migrieren ist gleichzeitig ein Daten-, Traffic- und Observability-Problem. Hier ist das Playbook, das wir Schritt für Schritt verwenden."
date: 2026-11-15
author: barannayir
tags: [devops-cicd-modernization, kubernetes-migration-strategy, zero-downtime-deployment, container-orchestration-legacy, statefulset-data-migration, kubernetes]
category: DevOps CI/CD Modernization
image: /assets/images/blog/2026-11-15-kubernetes-migration-zero-downtime.png
i18n_key: kubernetes-migration-zero-downtime
permalink: /de/blog/2026-11-15-kubernetes-migration-zero-downtime/
---

# Kubernetes-Migration für Legacy-B2B: Zero-Downtime-Playbook

Die meisten Legacy-B2B-Anwendungen laufen auf einer einzigen VM, sprechen mit einer einzigen Datenbank und bedienen Traffic über einen Load Balancer, der seit Jahren funktioniert. Eine davon nach Kubernetes — eine Container-Orchestrierungsplattform, die Deployment, Skalierung und Verwaltung von containerisierten Anwendungen automatisiert — ohne Ausfallzeit zu migrieren, ist ein kontrollierter Austausch jedes beweglichen Teils, während das System weiterhin zahlende Kunden bedient. Dies ist das Playbook, das wir bei [DevOps CI/CD Modernization](/de/devops-cicd-modernization/) Projekten verwenden.

## 1. Warum Big-Bang-Migrationen scheitern

Die Versuchung ist groß: die App containerisieren, Kubernetes auf die Datenbank zeigen lassen, den Load Balancer umschalten, fertig. Fehlermodi sind vorhersehbar: Verbindungszeichenfolgen verhalten sich in reschedulable Pods anders; eine jahrelang optimierte Datenbank überlebt keine plötzliche Änderung der Verbindungsmuster; In-Memory-Session-State verschwindet beim ersten Pod-Neustart; Rollback ist undefiniert, weil das Legacy-System bereits abgebaut wurde. Die Alternative ist inkrementell: einen Slice nach dem anderen ersetzen, das alte System parallel weiter laufen lassen.

## 2. Das Strangler-Fig-Pattern

Eine neue Komponente wächst um die alte herum, Request für Request, bis das Legacy-System nichts mehr zu tun hat. Einen Cluster aufsetzen, der das Legacy spiegelt; eine Routing-Schicht davor — ein Ingress-Controller (NGINX, Traefik) oder ein Service Mesh (Istio, Linkerd), der Traffic nach Pfad, Header oder Cookie lenkt; einen Slice auswählen, typischerweise den Read-Only-Endpoint mit dem geringsten Risiko, und einen kleinen Prozentsatz des Traffics auf den neuen Service routen; die Metriken beobachten. Halten sie, den Slice erweitern. Brechen sie, schickt der Router den Traffic zurück zum Legacy. Das Pattern ist absichtlich langsam: 5-10% der Endpoints pro Monat, vollständiger Cutover in 6-12 Monaten.

## 3. Die Datenschicht: StatefulSets

Der schwierigste Teil sind die Daten. Stateless Services können in Tagen ersetzt werden; Stateful Data braucht Wochen.

Die Primitiven: **StatefulSet** gibt jedem Pod eine stabile Identität und Storage. **PersistentVolume (PV) und PersistentVolumeClaim (PVC)** sind die Storage-Schicht, unterstützt durch eine Cloud-Disk oder einen CSI-Treiber (Container Storage Interface — das Standard-Plugin, mit dem Kubernetes mit jedem Storage-Backend spricht). **Headless Service** ist ein Service ohne Cluster-IP, der jedem StatefulSet-Replica eine eigene DNS gibt.

Die Sequenz: **Backfill** mit mysqldump, pg_dump oder einem Vendor-Export, dann Zeilenzahlen und Checksummen verifizieren; **CDC** (Change Data Capture) via logischer Replikation (Postgres Logical Decoding, MySQL Binlog oder Debezium); ein **Dual-Write-Fenster** von unter zwei Wochen mit einem Reconciliation-Job, der beide Seiten nächtlich vergleicht; **Cutover**, der den Primary auf den neuen StatefulSet umschaltet; **Decommission** erst, nachdem Reconciliation eine volle Woche sauber war. Bei jedem Schritt reversibel bis zum finalen Cutover.

## 4. Traffic-Shift-Strategien

Drei Strategien, in Reihenfolge des Risikos. **Canary**: 1-5% des Traffics routen, 30-60 Minuten halten, Fehlerrate, Latenz und Business-KPIs gegen Baseline vergleichen, dann auf 10%, 25%, 50%, 100% erweitern, wenn sauber. **Blue-Green**: neue Version neben der alten aufsetzen, den Load Balancer atomar umschalten, alte Umgebung 24 Stunden warm halten für sofortigen Rollback — höhere Kosten, geringeres Risiko am Cutover-Fenster. **Weighted Routing** splittet Traffic prozentual über das Service Mesh; nützlich für A/B-Tests, weniger nützlich für Migrationen. Wir nutzen Canary für die meisten Migrationen, Blue-Green für den finalen Cutover.

## 5. Observability: Die vier Golden Signals

Jeder neue Service bekommt vor dem ersten Traffic die gleichen vier Signale: **Latency** (p50, p95, p99), **Traffic** (Requests pro Sekunde nach Endpoint und Tier), **Errors** (4xx und 5xx mit getaggten Business-Level-Fehlern) und **Saturation** (CPU, Memory, Connection Pool, Database Replica Lag). Mit der Legacy-Baseline vergleichen — das erste Anzeichen von Ärger ist meist eine kleine Drift in p99-Latenz, kein Error-Spike.

## 6. Der Rollback-Plan

Jeder Schritt braucht vor seinem Start einen dokumentierten Rollback-Pfad. Regel: jeder Schritt, der mehr als 30 Minuten zum Rückwärtslaufen braucht, ist zu riskant. Der Router schickt 100% des Traffics in unter einer Minute zurück zum Legacy; das Dual-Write-Fenster stoppt sofort; Legacy bleibt 30 Tage nach Cutover warm; Datenbank-Snapshots werden vor und nach jedem Cutover gemacht und 90 Tage gehalten. Wenn Rollback nötig ist, ohne Zögern ausführen — die Kosten eines langsamen Rollbacks sind fast immer höher als die Kosten einer verzögerten Migration.

## 7. Pre-Migration-Checkliste

Vor dem ersten Canary: Legacy-Umgebung dokumentiert; Kubernetes-Cluster zur Legacy-Netzwerk gespiegelt; StatefulSet-Datenmigration auf einer Produktionskopie geprobt; Reconciliation-Job drei Nächte sauber; vier Golden Signals instrumentiert; Rollback-Verfahren unter fünf Minuten getestet; On-Call-Rotation besetzt; Status-Seite bereit.

## Abschluss

Eine Zero-Downtime-Kubernetes-Migration ist eine Sequenz kleiner, reversibler Schritte, jeweils abgesichert durch Daten, Metriken und einen Rollback, der tatsächlich getestet wurde. Strangler Fig, synchronisierte Daten, gewichtetes Traffic-Shifting und disziplinierte Observability erzeugen eine Migration, die Kunden nie sehen. Siehe unseren [DevOps CI/CD Modernization](/de/devops-cicd-modernization/) Pillar für den breiteren Kontext.