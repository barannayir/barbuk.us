---
layout: post.liquid
title: "Migración de bases de datos heredadas: 5 estrategias que realmente funcionan en producción"
description: "Las migraciones big-bang de bases de datos fallan. Aquí van 5 estrategias incrementales que hemos usado en sistemas reales de producción para salir de bases heredadas sin downtime ni pérdida de datos."
date: 2027-01-21
author: barannayir
tags: [base-de-datos, migracion, legacy, sql-server, postgres, strangler-fig]
category: Modernización legacy
image: /assets/images/blog/2027-01-21-legacy-database-migration.png
i18n_key: legacy-database-migration
permalink: /es/blog/2027-01-21-legacy-database-migration/
---

# Migración de bases de datos heredadas: 5 estrategias que realmente funcionan en producción

Las migraciones big-bang de bases de datos fallan. El patrón es bien conocido: un equipo planifica un cutover de fin de semana de SQL Server 2008 a PostgreSQL 16, la migración corre 4x más lento de lo previsto, el cutover se desliza al lunes, el rollback falla, y la empresa pasa tres meses recuperándose.

Este artículo son las cinco estrategias que usamos en su lugar. Cada una es incremental, tiene un rollback definido, y se ha usado en compromisos reales de [modernización legacy](/es/legacy-modernization/).

## Estrategia 1: El strangler fig (largo plazo, bajo riesgo)

El patrón strangler fig, aplicado a bases de datos: mantener la base heredada en marcha, enrutar las nuevas escrituras a la nueva base, y migrar las lecturas de forma incremental.

Implementación:
1. Levantar la nueva base (p. ej. PostgreSQL 16) junto a la heredada.
2. La aplicación escribe en ambas bases durante un periodo de transición (dual-write).
3. Las features nuevas leen y escriben solo en la nueva base.
4. Migrar las lecturas antiguas servicio a servicio.
5. Una vez migradas todas las lecturas, detener el dual-write.
6. Retirar la base heredada.

El valor por defecto correcto. Es incremental, el rollback es trivial, y el equipo aprende la nueva base en producción con poco en juego. El inconveniente: tarda 12-18 meses para un sistema medio.

## Estrategia 2: Ejecución paralela con reconciliación (medio plazo, mayor riesgo)

Ejecutar ambas bases en paralelo, pero leer de la base heredada. Reconciliar periódicamente la nueva base contra la heredada para verificar la corrección.

Esta estrategia es correcta cuando:
- La base heredada es fiable pero está en una plataforma al final de su vida
- Tiene la madurez operativa para ejecutar la reconciliación
- La aplicación puede tolerar dual-writes sin degradación de rendimiento

Usamos esta estrategia para sistemas financieros donde la corrección debe demostrarse, no asumirse. Tarda 4-6 meses para un sistema medio.

## Estrategia 3: Primero la read replica (ganancia rápida, alcance limitado)

Si el objetivo es sacar lecturas de la base heredada (p. ej. para reporting), empiece con read replicas de la nueva base, alimentadas vía change data capture (CDC) desde la heredada.

Herramientas: Debezium para CDC, Kafka para el transporte, PostgreSQL o Snowflake como destino.

El primer paso correcto para cargas analytics. Las consultas de reporting dejan de competir con las escrituras operativas. El alcance de la migración es limitado (solo lecturas), así que el riesgo es bajo.

## Estrategia 4: Migración schema-first (táctica, específica)

Para sistemas con un esquema bien definido, una migración schema-first puede ser el enfoque correcto:
1. Definir explícitamente el esquema destino.
2. Escribir un script de migración one-shot con transformación fila a fila.
3. Probar el script de migración sobre datos de tamaño producción.
4. Ejecutar durante una ventana de mantenimiento.
5. Pasar la aplicación a la nueva base.

Caso de uso correcto: bases pequeñas (< 50 GB), esquemas simples, reglas de negocio bien definidas.

Caso de uso incorrecto: bases grandes, esquemas complejos, o sistemas donde se requiere disponibilidad 24/7.

## Estrategia 5: Comprar tiempo con el sistema heredado (cuando la migración es la respuesta incorrecta)

A veces la respuesta correcta es mantener la base heredada. Si la base funciona y el coste de la migración supera el beneficio, la migración es incorrecta.

Hemos visto a equipos gastar 500 k € migrando un sistema SQL Server 2008 a PostgreSQL 16, cuando podrían haber pagado 30 k €/año por un contrato de soporte extendido y gastado el presupuesto de migración en una nueva feature. La migración estaba políticamente motivada, no técnicamente justificada.

## Elegir la estrategia

La estrategia correcta depende de tres factores:
- **Forcing function**: ¿hay una fecha límite (fin de vida del vendor, hallazgo de auditoría, apagado de infraestructura)?
- **Tamaño del sistema**: ¿cuántos datos, cuántas tablas, cuántos puntos de integración?
- **Tolerancia al riesgo**: ¿puede la empresa tolerar una ejecución paralela de meses?

## Cierre

La estrategia correcta de migración de base de datos es incremental, tiene un rollback definido, y se ajusta a la forcing function y al tamaño del sistema. El enfoque big-bang falla en producción; los enfoques incrementales triunfan.

Para el contexto más amplio de cuándo encaja la migración de base de datos en un [programa de modernización legacy](/es/legacy-modernization/), y cuándo dejar el sistema en paz, vea nuestra visión general. Para las decisiones de arquitectura que suelen seguir a la migración de base de datos, vea [monolito vs microservicios](/es/blog/2026-12-17-monolith-vs-microservices/).