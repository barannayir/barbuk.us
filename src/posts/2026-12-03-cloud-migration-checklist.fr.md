---
layout: post.liquid
title: "Checklist migration cloud : 12 choses à décider avant de déplacer un seul serveur"
description: "La plupart des migrations cloud échouent en phase de planification. Voici la checklist en 12 points que nous appliquons avant toute migration de charge de production."
date: 2026-12-03
author: barannayir
tags: [migration-cloud, aws, azure, kubernetes, checklist]
category: Migration cloud
image: /assets/images/blog/2026-12-03-cloud-migration-checklist.png
i18n_key: cloud-migration-checklist
permalink: /fr/blog/2026-12-03-cloud-migration-checklist/
---

# Checklist migration cloud : 12 choses à décider avant de déplacer un seul serveur

La plupart des migrations cloud n'échouent pas pendant la migration. Elles échouent pendant la planification — quand les équipes déplacent des charges qui auraient dû rester on-prem, ou déplacent des charges sans préserver les contrats dont dépendent les systèmes en aval.

Cet article est la checklist en 12 points que nous exécutons avant tout [projet de migration cloud](/fr/cloud-migration-services/). Ce n'est pas une méthodologie d'éditeur ; c'est le minimum vital pour que la migration survive.

## L'inventaire

**1. Quelles charges, par ordre de priorité.** Listez-les. Classez par criticité métier et risque de migration. Ne migrez pas dans l'ordre alphabétique.

**2. Dépendances entre charges.** L'application A parle à l'application B qui écrit dans la base C qui est lue par l'outil de reporting D. Cartographiez. Sauter cette étape est la cause la plus fréquente d'incidents de migration cloud.

**3. Gravité des données.** Où vivent les données aujourd'hui, quelle est leur taille, et quel est le coût d'egress pour les déplacer ?

## Les décisions d'architecture

**4. Rehost, replatform ou refactor.** Soyez honnête sur ce qui mérite quoi. Rehost (lift-and-shift vers VMs) convient aux systèmes que vous prévoyez de retirer dans 18 mois.

**5. Kubernetes — oui ou non.** De nombreuses charges n'ont pas besoin de Kubernetes. Adoptez Kubernetes uniquement pour les systèmes avec une charge vraiment variable ou des besoins d'orchestration complexes. Nous partons par défaut sur .NET sur AKS ou EKS pour les systèmes à longue durée de vie.

**6. Mono-cloud, multi-cloud ou hybride.** Le multi-cloud est un concept marketing, pas une stratégie, sauf exigence réglementaire spécifique.

## Les décisions opérationnelles

**7. Identité et accès.** Décidez comment l'identité est gérée dans le cloud — Azure AD / Entra ID, AWS IAM ou fédération avec votre annuaire existant. Faites-le avant tout déplacement de charge.

**8. Topologie réseau.** Hub-and-spoke avec un seul VPC/VNet par environnement, full mesh, ou isolé par charge ?

**9. Observabilité.** Logs, métriques, traces — où vont-ils, qui peut les voir, combien de temps sont-ils conservés ? Si vous ne pouvez pas répondre, ne migrez rien.

## Les décisions de coût et de risque

**10. Modèle de coût et plafond.** Fixez un plafond mensuel par environnement. La plupart découvrent qu'elle est 30–50 % plus élevée que prévu.

**11. Plan de rollback.** Pour chaque charge, écrivez : comment revenir on-prem dans les 30 premiers jours si la migration casse ?

**12. Plan de mise hors service de la source.** Que devient le serveur on-prem après le cutover ?

## Conclusion

Cette checklist est le plancher, pas le plafond. Chaque point est quelque chose que nous avons soit manqué sur un projet (et payé), soit vu quelqu'un d'autre manquer.

Le schéma le plus fréquent quand nous corrigeons les migrations des autres est le même ensemble d'erreurs. Les entreprises qui parcourent cette liste avant le cutover économisent entre 50 k € et 500 k € en coûts de récupération.

Pour les décisions d'architecture monolith vs microservices — une question connexe à laquelle de nombreuses équipes font face dans le contexte cloud — voir notre prochain article dans cette série. Pour un examen approfondi des [systèmes legacy qui déclenchent la plupart des migrations cloud](/fr/legacy-modernization/), voir notre récent article sur les coûts cachés.