---
layout: post.liquid
title: "Migration Kubernetes pour applications B2B héritées : playbook zéro temps d'arrêt"
description: "Migrer une application B2B héritée vers Kubernetes sans temps d'arrêt est un problème de données, de trafic et d'observabilité à la fois. Voici le playbook que nous utilisons, étape par étape."
date: 2026-11-15
author: barannayir
tags: [devops-cicd-modernization, kubernetes-migration-strategy, zero-downtime-deployment, container-orchestration-legacy, statefulset-data-migration, kubernetes]
category: DevOps CI/CD Modernization
image: /assets/images/blog/2026-11-15-kubernetes-migration-zero-downtime.png
i18n_key: kubernetes-migration-zero-downtime
permalink: /fr/blog/2026-11-15-kubernetes-migration-zero-downtime/
---

# Migration Kubernetes pour B2B hérité : playbook zéro temps d'arrêt

La plupart des applications B2B héritées tournent sur une seule VM, communiquent avec une seule base et desservent du trafic via un load balancer qui fonctionne depuis des années. En migrer une vers Kubernetes — une plateforme d'orchestration de conteneurs qui automatise le déploiement, la mise à l'échelle et la gestion des applications conteneurisées — sans temps d'arrêt est un remplacement contrôlé de chaque pièce, pendant que le système sert toujours des clients payants. Voici le playbook que nous utilisons, étape par étape.

## 1. Pourquoi les migrations big-bang échouent

La tentation est de conteneuriser l'app, pointer Kubernetes vers la base, basculer le load balancer, livrer. Les modes d'échec sont prévisibles : chaînes de connexion différentes dans des pods re-planifiables ; une base optimisée pendant des années ne survit pas à un changement soudain des patterns de connexion ; l'état de session en mémoire disparaît au premier redémarrage ; le rollback est indéfini parce que le système hérité est déjà démantelé. L'alternative est incrémentale : remplacer une tranche à la fois, garder l'ancien en parallèle.

## 2. Le pattern Strangler Fig

Un nouveau composant pousse autour de l'ancien, requête après requête, jusqu'à ce que le legacy n'ait plus rien à faire. Mettre en place un cluster miroir du legacy ; placer une couche de routage devant — un ingress controller (NGINX, Traefik) ou un service mesh (Istio, Linkerd) dirigeant le trafic par chemin, en-tête ou cookie ; choisir une tranche, typiquement l'endpoint read-only au plus faible risque, et router un petit pourcentage du trafic vers le nouveau service ; observer les métriques. Si elles tiennent, élargir la tranche. Si elles cassent, le routeur renvoie au legacy. Le pattern est lent à dessein : 5-10% des endpoints par mois, cutover complet en 6-12 mois.

## 3. La couche données : StatefulSets

La partie la plus difficile, ce sont les données. Les services stateless peuvent être remplacés en quelques jours ; les données stateful prennent des semaines.

Les primitives : **StatefulSet** donne à chaque pod identité et stockage stables. **PersistentVolume (PV) et PersistentVolumeClaim (PVC)** sont la couche de stockage, adossés à un disque cloud ou à un driver CSI (Container Storage Interface — le plugin standard que Kubernetes utilise pour parler à tout backend de stockage). **Headless Service** est un Service sans IP de cluster qui donne à chaque replica StatefulSet son propre DNS.

La séquence : **backfill** avec mysqldump, pg_dump, ou export vendor, vérifier les comptes et checksums ; **CDC** (Change Data Capture) via réplication logique (Postgres logical decoding, MySQL binlog, ou Debezium) ; une **fenêtre dual-write** de moins de deux semaines, avec un job de réconciliation comparant les deux côtés chaque nuit ; **cutover** qui bascule la primaire sur le nouveau StatefulSet ; **decommission** après une semaine de réconciliation propre. Réversible à chaque étape jusqu'au cutover final.

## 4. Stratégies de décalage de trafic

Trois stratégies, par risque. **Canary** : router 1-5% du trafic, tenir 30-60 minutes, comparer taux d'erreur, latence et KPIs business à la baseline, puis étendre à 10%, 25%, 50%, 100% si propre. **Blue-Green** : déployer la nouvelle version à côté de l'ancienne, basculer le load balancer atomiquement, garder l'ancien environnement chaud 24 heures pour rollback instantané — coût plus élevé, risque plus bas au cutover. **Weighted routing** découpe le trafic en pourcentage via le service mesh ; utile pour A/B testing, moins pour les migrations. Canary pour la plupart des migrations, blue-green pour le cutover final.

## 5. Observabilité : les quatre signaux d'or

Chaque nouveau service reçoit les mêmes quatre signaux avant tout trafic : **Latency** (p50, p95, p99), **Traffic** (requêtes par seconde par endpoint et tier), **Errors** (4xx et 5xx avec échecs business-level tagués), et **Saturation** (CPU, mémoire, connection pool, database replica lag). Comparer à la baseline legacy — le premier signe d'ennui est généralement une petite dérive de latence p99, pas un pic d'erreurs.

## 6. Le plan de rollback

Chaque étape a besoin d'une route de rollback documentée avant de commencer. Règle : toute étape qui prend plus de 30 minutes à inverser est trop risquée. Le routeur renvoie 100% du trafic au legacy en moins d'une minute ; la fenêtre dual-write s'arrête instantanément ; le legacy reste chaud 30 jours après le cutover ; des snapshots avant/après chaque cutover, conservés 90 jours. Si le rollback est nécessaire, l'exécuter sans hésitation — un rollback lent coûte presque toujours plus cher qu'une migration retardée.

## 7. Checklist pré-migration

Avant le premier canary : environnement legacy documenté ; cluster Kubernetes mis en miroir du réseau legacy ; migration de données StatefulSet répétée sur une copie de production ; job de réconciliation propre trois nuits ; quatre signaux d'or instrumentés ; procédure de rollback testée sous cinq minutes ; rotation on-call en place ; page de statut prête.

## Conclusion

Une migration Kubernetes sans temps d'arrêt est une séquence de petites étapes réversibles, chacune gardée par les données, les métriques et un rollback testé. Strangler Fig, données synchronisées, décalage de trafic pondéré et observabilité disciplinée produisent une migration que les clients ne voient jamais. Plus sur [DevOps CI/CD Modernization](/fr/devops-cicd-modernization/).