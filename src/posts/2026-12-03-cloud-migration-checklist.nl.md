---
layout: post.liquid
title: "Cloudmigratie-checklist: 12 dingen die u moet beslissen voordat u één server verplaatst"
description: "De meeste cloudmigraties gaan mis in de planningsfase. Hier is de 12-puntenchecklist die we hanteren vóór elke productiemigratie."
date: 2026-12-03
author: barannayir
tags: [cloudmigratie, aws, azure, kubernetes, checklist]
category: Cloudmigratie
image: /assets/images/blog/2026-12-03-cloud-migration-checklist.png
i18n_key: cloud-migration-checklist
permalink: /nl/blog/2026-12-03-cloud-migration-checklist/
---

# Cloudmigratie-checklist: 12 dingen die u moet beslissen voordat u één server verplaatst

De meeste cloudmigraties falen niet tijdens de migratie. Ze falen tijdens de planning — wanneer teams workloads naar de cloud verplaatsen die on-premises hadden moeten blijven, of workloads verplaatsen zonder de contracten te behouden waarvan afhankelijke systemen afhankelijk zijn.

Dit artikel is de 12-puntenchecklist die we hanteren voor elk [cloudmigratieproject](/nl/cloud-migration-services/). Het is geen leveranciersmethodologie; het is het minimum waarmee de migratie overleeft.

## De inventaris

**1. Welke workloads, in prioriteitsvolgorde.** Noteer ze. Rangschik op bedrijfskritikaliteit en migratierisico. Migreer niet in alfabetische volgorde.

**2. Afhankelijkheden tussen workloads.** Applicatie A praat met applicatie A die naar database A schrijft die door rapportagetool A wordt gelezen. Breng het in kaart. Deze stap overslaan is de meest voorkomende oorzaak van cloudmigratie-incidenten.

**3. Datagravitatie.** Waar leven de gegevens vandaag, hoe groot zijn ze, en wat zijn de egress-kosten om ze te verplaatsen?

## De architectuurbeslissingen

**4. Rehost, replatform of refactor.** Wees eerlijk welke workloads welke behandeling verdienen. Rehost (lift-and-shift naar VMs) is goed voor systemen die u binnen 18 maanden buiten gebruik wilt stellen.

**5. Kubernetes — ja of nee.** Veel workloads hebben geen Kubernetes nodig. Gebruik Kubernetes alleen voor systemen met echt variabele belasting of complexe orkestratiebehoeften. We standaardiseren op .NET op AKS of EKS voor systemen met een lange levensduur.

**6. Single cloud, multi-cloud of hybride.** Multi-cloud is een marketingconcept, geen strategie, tenzij u een specifieke regelgevende eis heeft.

## De operationele beslissingen

**7. Identiteit en toegang.** Beslis hoe identiteit in de cloud wordt beheerd — Azure AD / Entra ID, AWS IAM of federatie met uw bestaande directory. Doe dit voordat een workload wordt verplaatst.

**8. Netwerktopologie.** Hub-and-spoke met één VPC/VNet per omgeving, volledig mesh, of geïsoleerd per workload?

**9. Observability.** Logs, metrics, traces — waar gaan ze heen, wie kan ze zien, hoe lang worden ze bewaard? Als u deze vraag niet kunt beantwoorden, migreer dan niets.

## De kosten- en risicobeslissingen

**10. Kostenmodel en plafond.** Stel een maandelijks kostenplafond per omgeving in. De meeste bedrijven ontdekken dat hun cloudrekening 30–50% hoger is dan geprojecteerd.

**11. Terugvalplan.** Schrijf voor elke workload op: hoe keren we in de eerste 30 dagen terug naar on-premises als de cloudmigratie breekt?

**12. Plan voor buitengebruikstelling van de bron.** Wat gebeurt er met de on-premises server na de cutover?

## Afsluiting

Deze checklist is de vloer, niet het plafond. Elk item is iets dat we ofwel op een project hebben gemist (en betaald), ofwel bij iemand anders hebben zien missen.

Het meest voorkomende patroon bij het repareren van andermans migraties is dezelfde reeks fouten. Bedrijven die deze lijst voor de cutover doorlopen, besparen tussen €50k en €500k aan herstelkosten.

Voor de diepere architectuurbeslissingen rondom monoliet vs microservices — een verwante vraag waar veel teams in de cloudcontext mee te maken krijgen — zie ons komende bericht in deze reeks. Voor een nadere blik op de [legacy-systemen die de meeste cloudmigraties überhaupt veroorzaken](/nl/legacy-modernization/), zie ons recente stuk over verborgen kosten.