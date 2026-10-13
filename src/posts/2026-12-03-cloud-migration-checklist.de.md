---
layout: post.liquid
title: "Cloud-Migration-Checkliste: 12 Dinge, die Sie entscheiden müssen, bevor Sie einen einzigen Server verschieben"
description: "Die meisten Cloud-Migrationen scheitern in der Planungsphase. Hier ist die 12-Punkte-Checkliste, die wir vor jeder Produktionsmigration verwenden."
date: 2026-12-03
author: barannayir
tags: [cloud-migration, aws, azure, kubernetes, checkliste]
category: Cloud-Migration
image: /assets/images/blog/2026-12-03-cloud-migration-checklist.png
i18n_key: cloud-migration-checklist
permalink: /de/blog/2026-12-03-cloud-migration-checklist/
---

# Cloud-Migration-Checkliste: 12 Dinge, die Sie entscheiden müssen, bevor Sie einen einzigen Server verschieben

Die meisten Cloud-Migrationen scheitern nicht während der Migration. Sie scheitern in der Planung — wenn Teams Workloads in die Cloud verschieben, die on-prem geblieben wären, oder Workloads verschieben, ohne die Verträge zu erhalten, von denen abhängige Systeme abhängen.

Dieser Artikel ist die 12-Punkte-Checkliste, die wir vor jedem [Cloud-Migrationsprojekt](/de/cloud-migration-services/) durchgehen. Es ist keine Vendor-Methodik; es ist das Minimum, das die Migration überlebt.

## Die Inventur

**1. Welche Workloads, in Prioritätsreihenfolge.** Schreiben Sie sie auf. Sortieren Sie nach Geschäftskritikalität und Migrationsrisiko. Migrieren Sie nicht in alphabetischer Reihenfolge.

**2. Abhängigkeiten zwischen Workloads.** Anwendung A spricht mit Anwendung B, die in Datenbank C schreibt, die vom Reporting-Tool D gelesen wird. Kartieren Sie das. Diesen Schritt zu überspringen ist die häufigste Ursache für Cloud-Migrationsvorfälle.

**3. Datengravitation.** Wo leben die Daten heute, wie groß sind sie, und was sind die Egress-Kosten für die Verlagerung?

## Die Architekturentscheidungen

**4. Rehost, Replatform oder Refactor.** Seien Sie ehrlich, welche Workloads welches Treatment verdienen. Rehost (Lift-and-Shift zu VMs) ist richtig für Systeme, die Sie in 18 Monaten außer Betrieb nehmen wollen.

**6. Kubernetes — ja oder nein.** Viele Workloads brauchen kein Kubernetes. Übernehmen Sie Kubernetes nur für Systeme mit wirklich variabler Last oder komplexen Orchestrierungsanforderungen. Wir setzen standardmäßig auf .NET auf AKS oder EKS für Systeme mit langen Lebensdauern.

**6. Single Cloud, Multi-Cloud oder Hybrid.** Multi-Cloud ist ein Marketingkonzept, keine Strategie, sofern Sie keine spezifische regulatorische Anforderung haben.

## Die Betriebsentscheidungen

**7. Identität und Zugriff.** Entscheiden Sie, wie Identität in der Cloud verwaltet wird — Azure AD / Entra ID, AWS IAM oder Föderation mit Ihrem bestehenden Verzeichnis. Tun Sie dies, bevor irgendein Workload verschoben wird.

**8. Netzwerktopologie.** Hub-and-Spoke mit einer einzigen VPC/VNet pro Umgebung, oder Full Mesh, oder isoliert pro Workload?

**9. Observability.** Logs, Metriken, Traces — wo gehen sie hin, wer kann sie sehen, wie lange werden sie aufbewahrt? Wenn Sie diese Frage nicht beantworten können, migrieren Sie nichts.

## Die Kosten- und Risikoentscheidungen

**10. Kostenmodell und -deckel.** Setzen Sie eine monatliche Kostendecke pro Umgebung. Die meisten Unternehmen entdecken, dass ihre Cloud-Rechnung 30–50 % höher ist als prognostiziert.

**11. Rollback-Plan.** Schreiben Sie für jeden Workload auf: Wie kommen wir in den ersten 30 Tagen zurück zu On-Prem, wenn die Cloud-Migration bricht?

**12. Außerbetriebnahmeplan für die Quelle.** Was passiert mit dem On-Prem-Server nach dem Cutover?

## Abschluss

Diese Checkliste ist der Boden, nicht die Decke. Jeder Punkt ist etwas, das wir entweder in einem Projekt übersehen haben (und dafür bezahlt haben) oder bei jemand anderem beobachtet haben.

Das häufigste Muster beim Fixen der Migrationen anderer ist der gleiche Satz von Fehlern. Unternehmen, die diese Liste vor dem Cutover durchgehen, sparen zwischen 50.000 € und 500.000 € an Wiederherstellungskosten.

Für die tieferen Architekturentscheidungen rund um Monolith vs. Microservices — eine verwandte Frage, der sich viele Teams im Cloud-Kontext stellen — siehe unseren kommenden Beitrag in dieser Reihe. Für einen genaueren Blick auf die [Legacy-Systeme, die die meisten Cloud-Migrationen überhaupt erst auslösen](/de/legacy-modernization/), siehe unseren aktuellen Beitrag zu versteckten Kosten.