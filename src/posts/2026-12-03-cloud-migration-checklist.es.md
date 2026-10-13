---
layout: post.liquid
title: "Checklist de migración a la nube: 12 cosas que decidir antes de mover un solo servidor"
description: "La mayoría de las migraciones a la nube fracasan en la fase de planificación. Aquí está la checklist de 12 puntos que usamos antes de cualquier migración de cargas de producción."
date: 2026-12-03
author: barannayir
tags: [migracion-nube, aws, azure, kubernetes, checklist]
category: Migración a la nube
image: /assets/images/blog/2026-12-03-cloud-migration-checklist.png
i18n_key: cloud-migration-checklist
permalink: /es/blog/2026-12-03-cloud-migration-checklist/
---

# Checklist de migración a la nube: 12 cosas que decidir antes de mover un solo servidor

La mayoría de las migraciones a la nube no fracasan durante la migración. Fracasan durante la planificación — cuando los equipos mueven cargas que deberían quedarse on-prem, o mueven cargas sin preservar los contratos de los que dependen los sistemas aguas abajo.

Este artículo es la checklist de 12 puntos que ejecutamos antes de cualquier [proyecto de migración a la nube](/es/cloud-migration-services/). No es una metodología de proveedor; es el mínimo para que la migración sobreviva.

## El inventario

**1. Qué cargas, en orden de prioridad.** Anótelas. Ordene por criticidad de negocio y riesgo de migración. No migre en orden alfabético.

**2. Dependencias entre cargas.** La aplicación A habla con la aplicación B que escribe en la base de datos C que es leída por la herramienta de reporting D. Mapee. Saltarse este paso es la causa más común de incidentes de migración a la nube.

**3. Gravedad de los datos.** ¿Dónde viven los datos hoy, qué tamaño tienen y cuál es el coste de egreso al moverlos?

## Las decisiones de arquitectura

**4. Rehost, replatform o refactor.** Sea honesto sobre qué cargas merecen qué. Rehost (lift-and-shift a VMs) es adecuado para sistemas que planea retirar en 18 meses.

**5. Kubernetes — sí o no.** Muchas cargas no necesitan Kubernetes. Adopte Kubernetes solo para sistemas con carga genuinamente variable o necesidades de orquestación complejas. Por defecto usamos .NET sobre AKS o EKS para sistemas con larga vida.

**6. Nube única, multi-nube o híbrida.** Multi-nube es un concepto de marketing, no una estrategia, salvo un requisito regulatorio específico.

## Las decisiones operativas

**7. Identidad y acceso.** Decida cómo se gestiona la identidad en la nube — Azure AD / Entra ID, AWS IAM o federación con su directorio existente. Hágalo antes de mover cualquier carga.

**8. Topología de red.** Hub-and-spoke con un único VPC/VNet por entorno, full mesh o aislado por carga.

**9. Observabilidad.** Logs, métricas, trazas — ¿adónde van, quién puede verlos, cuánto se retienen? Si no puede responder, no migre nada.

## Las decisiones de coste y riesgo

**10. Modelo de coste y techo.** Establezca un techo mensual por entorno. La mayoría descubre que su factura cloud es 30–50% superior a lo proyectado.

**11. Plan de rollback.** Para cada carga, escriba: ¿cómo volvemos a on-prem en los primeros 30 días si la migración a la nube se rompe?

**12. Plan de retirada del origen.** ¿Qué pasa con el servidor on-prem tras el cutover?

## Cierre

Esta checklist es el suelo, no el techo. Cada elemento es algo que o bien hemos fallado en un proyecto (y pagado), o bien hemos visto fallar a otros.

El patrón más común al arreglar las migraciones de otros es el mismo conjunto de fallos. Las empresas que recorren esta lista antes del cutover se ahorran entre 50 k € y 500 k € en costes de recuperación.

Para las decisiones de arquitectura más profundas sobre monolito vs microservicios — una pregunta relacionada a la que muchos equipos se enfrentan en el contexto cloud — vea nuestro próximo post en esta serie. Para una mirada más cercana a los [sistemas heredados que provocan la mayoría de migraciones a la nube](/es/legacy-modernization/) en primer lugar, vea nuestra pieza reciente sobre costes ocultos.