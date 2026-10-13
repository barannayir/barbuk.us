---
layout: post.liquid
title: "Migration de base de données legacy : 5 stratégies qui fonctionnent réellement en production"
description: "Les migrations big-bang de bases de données échouent. Voici 5 stratégies incrémentielles que nous avons utilisées sur de vrais systèmes de production pour sortir de bases legacy sans downtime ni perte de données."
date: 2027-01-21
author: barannayir
tags: [base-de-donnees, migration, legacy, sql-server, postgres, strangler-fig]
category: Modernisation legacy
image: /assets/images/blog/2027-01-21-legacy-database-migration.png
i18n_key: legacy-database-migration
permalink: /fr/blog/2027-01-21-legacy-database-migration/
---

# Migration de base de données legacy : 5 stratégies qui fonctionnent réellement en production

Les migrations big-bang de bases de données échouent. Le pattern est bien connu : une équipe planifie un cutover de week-end de SQL Server 2008 vers PostgreSQL 16, la migration tourne 4x plus lentement que prévu, le cutover glisse à lundi, le rollback échoue, et l'entreprise passe trois mois à récupérer.

Cet article est les cinq stratégies que nous utilisons à la place. Chacune est incrémentielle, a un rollback défini, et a été utilisée dans de vrais engagements de [modernisation legacy](/fr/legacy-modernization/).

## Stratégie 1 : Le figuier étrangleur (long terme, faible risque)

Le pattern strangler fig, appliqué aux bases de données : garder la base legacy en marche, router les nouvelles écritures vers la nouvelle base, et migrer les lectures incrémentiellement.

Implémentation :
1. Mettre en place la nouvelle base (par ex. PostgreSQL 16) à côté de la legacy.
2. L'application écrit dans les deux bases pendant une période de transition (dual-write).
3. Les nouvelles features lisent et écrivent uniquement dans la nouvelle base.
4. Migrer les anciennes lectures un service à la fois.
5. Une fois toutes les lectures migrées, arrêter le dual-write.
6. Mettre hors service la base legacy.

Le bon défaut. C'est incrémentiel, le rollback est trivial, et l'équipe apprend la nouvelle base en production avec un enjeu faible. L'inconvénient : cela prend 12-18 mois pour un système de taille moyenne.

## Stratégie 2 : Exécution parallèle avec réconciliation (moyen terme, risque plus élevé)

Faire tourner les deux bases en parallèle, mais lire depuis la base legacy. Réconcilier périodiquement la nouvelle base contre la legacy pour vérifier la correction.

Cette stratégie est juste quand :
- La base legacy est fiable mais sur une plateforme en fin de vie
- Vous avez la maturité opérationnelle pour exécuter la réconciliation
- L'application peut tolérer des dual-writes sans dégradation de performance

Nous utilisons cette stratégie pour les systèmes financiers où la correction doit être prouvée, pas supposée. Cela prend 4-6 mois pour un système de taille moyenne.

## Stratégie 3 : Read replica d'abord (gain rapide, portée limitée)

Si l'objectif est de déplacer les lectures hors de la base legacy (par ex. pour le reporting), commencez par des read replicas de la nouvelle base, alimentées via change data capture (CDC) depuis la legacy.

Outils : Debezium pour CDC, Kafka pour le transport, PostgreSQL ou Snowflake comme cible.

Le bon premier pas pour les workloads analytics. Les requêtes de reporting ne concurrencent plus les écritures opérationnelles. La portée de la migration est limitée (lectures seules), donc le risque est faible.

## Stratégie 4 : Migration schema-first (tactique, spécifique)

Pour les systèmes avec un schéma bien défini, une migration schema-first peut être la bonne approche :
1. Définir explicitement le schéma cible.
2. Écrire un script de migration one-shot avec transformation ligne par ligne.
3. Tester sur des données de taille production.
4. Exécuter pendant une fenêtre de maintenance.
5. Basculer l'application sur la nouvelle base.

Bon cas d'usage : petites bases (< 50 Go), schémas simples, règles métier bien définies.

Mauvais cas d'usage : grandes bases, schémas complexes, ou systèmes où la disponibilité 24/7 est requise.

## Stratégie 5 : Acheter du temps avec le système legacy (quand la migration est la mauvaise réponse)

Parfois la bonne réponse est de garder la base legacy. Si la base fonctionne et que le coût de la migration dépasse le bénéfice, la migration est mauvaise.

Nous avons vu des équipes dépenser 500 k € pour migrer un système SQL Server 2008 vers PostgreSQL 16, alors qu'elles auraient pu payer 30 k €/an pour un contrat de support étendu et dépenser le budget de migration sur une nouvelle feature. La migration était politiquement motivée, pas techniquement justifiée.

## Choisir la stratégie

La bonne stratégie dépend de trois facteurs :
- **Forcing function** : y a-t-il une échéance (fin de vie éditeur, constat d'audit, arrêt d'infrastructure) ?
- **Taille du système** : combien de données, combien de tables, combien de points d'intégration ?
- **Tolérance au risque** : l'entreprise peut-elle tolérer une exécution parallèle de plusieurs mois ?

## Conclusion

La bonne stratégie de migration de base de données est incrémentielle, a un rollback défini, et est adaptée à la forcing function et à la taille du système. L'approche big-bang échoue en production ; les approches incrémentielles réussissent.

Pour le contexte plus large de la place de la migration de base de données dans un [programme de modernisation legacy](/fr/legacy-modernization/), et quand laisser le système tranquille, voir notre vue d'ensemble. Pour les décisions d'architecture qui suivent souvent la migration de base, voir [monolithe vs microservices](/fr/blog/2026-12-17-monolith-vs-microservices/).