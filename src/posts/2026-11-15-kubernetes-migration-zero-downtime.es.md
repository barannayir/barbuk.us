---
layout: post.liquid
title: "Migración a Kubernetes de aplicaciones B2B heredadas: playbook de cero tiempo de inactividad"
description: "Migrar una aplicación B2B heredada a Kubernetes sin tiempo de inactividad es al mismo tiempo un problema de datos, tráfico y observabilidad. Aquí está el playbook que usamos, paso a paso."
date: 2026-11-15
author: barannayir
tags: [devops-cicd-modernization, kubernetes-migration-strategy, zero-downtime-deployment, container-orchestration-legacy, statefulset-data-migration, kubernetes]
category: DevOps CI/CD Modernization
image: /assets/images/blog/2026-11-15-kubernetes-migration-zero-downtime.png
i18n_key: kubernetes-migration-zero-downtime
permalink: /es/blog/2026-11-15-kubernetes-migration-zero-downtime/
---

# Migración a Kubernetes para B2B heredado: playbook de cero inactividad

La mayoría de aplicaciones B2B heredadas corren en una sola VM, hablan con una sola base y sirven tráfico mediante un balanceador que lleva años funcionando. Migrar una de ellas a Kubernetes — una plataforma de orquestación de contenedores que automatiza el despliegue, escalado y gestión de aplicaciones en contenedores — sin tiempo de inactividad es un reemplazo controlado de cada pieza, mientras el sistema sigue sirviendo a clientes que pagan. Este es el playbook que usamos en cada migración, paso a paso.

## 1. Por qué fallan las migraciones big-bang

La tentación es containerizar la app, apuntar Kubernetes a la base, conmutar el balanceador, enviar. Los modos de fallo son predecibles: las cadenas de conexión se comportan distinto en pods reprogramables; una base de datos afinada durante años no sobrevive un cambio brusco en los patrones de conexión; el estado de sesión en memoria desaparece en el primer reinicio; el rollback no está definido porque el sistema heredado ya fue desmantelado. La alternativa es incremental: reemplazar una rebanada a la vez, mantener el antiguo en paralelo.

## 2. El patrón Strangler Fig

Un nuevo componente crece alrededor del antiguo, petición a petición, hasta que el heredado ya no tiene nada que hacer. Montar un cluster espejo del heredado; colocar una capa de routing delante — un ingress controller (NGINX, Traefik) o un service mesh (Istio, Linkerd) que dirija el tráfico por ruta, cabecera o cookie; elegir una rebanada, típicamente el endpoint read-only de menor riesgo, y enrutar un pequeño porcentaje del tráfico al nuevo servicio; observar las métricas. Si aguantan, expandir la rebanada. Si fallan, el enrutador devuelve al heredado. Lento a propósito: 5-10% de los endpoints por mes, cutover completo en 6-12 meses.

## 3. La capa de datos: StatefulSets

La parte más difícil son los datos. Los servicios sin estado se reemplazan en días; los datos con estado tardan semanas.

Las primitivas: **StatefulSet** da a cada pod identidad y almacenamiento estables. **PersistentVolume (PV) y PersistentVolumeClaim (PVC)** son la capa de almacenamiento, respaldada por un disco en la nube o un driver CSI (Container Storage Interface — el plugin estándar que Kubernetes usa para hablar con cualquier backend de almacenamiento). **Headless Service** es un Service sin IP de cluster que da a cada réplica StatefulSet su propio DNS.

La secuencia: **backfill** con mysqldump, pg_dump o export vendor, verificar recuentos y checksums; **CDC** (Change Data Capture) vía replicación lógica (Postgres logical decoding, MySQL binlog o Debezium); una **ventana dual-write** de menos de dos semanas, con un job de reconciliación comparando ambos lados cada noche; **cutover** que invierte el primary al nuevo StatefulSet; **decommission** tras una semana de reconciliación limpia. Reversible en cada paso hasta el cutover final.

## 4. Estrategias de desplazamiento de tráfico

Tres estrategias, por riesgo. **Canary**: enrutar 1-5% del tráfico, mantener 30-60 minutos, comparar tasa de error, latencia y KPIs de negocio con la baseline, luego expandir a 10%, 25%, 50%, 100% si está limpio. **Blue-Green**: desplegar la nueva versión junto a la antigua, conmutar el balanceador atómicamente, mantener el entorno antiguo caliente 24 horas para rollback instantáneo — coste mayor, riesgo menor en el cutover. **Weighted routing** divide el tráfico porcentualmente vía service mesh; útil para A/B testing, menos para migraciones. Canary para la mayoría de migraciones, blue-green para el cutover final.

## 5. Observabilidad: las cuatro señales de oro

Cada servicio nuevo recibe las mismas cuatro señales antes de cualquier tráfico: **Latency** (p50, p95, p99), **Traffic** (peticiones por segundo por endpoint y tier), **Errors** (4xx y 5xx con errores de negocio etiquetados), y **Saturation** (CPU, memoria, connection pool, database replica lag). Comparar con la baseline heredada — el primer signo de problemas suele ser una pequeña deriva en la latencia p99, no un pico de errores.

## 6. El plan de rollback

Cada paso necesita una ruta de rollback documentada antes de empezar. Regla: cualquier paso que tarde más de 30 minutos en revertirse es demasiado arriesgado. El enrutador devuelve el 100% del tráfico al heredado en menos de un minuto; la ventana dual-write se detiene al instante; el heredado se mantiene caliente 30 días tras el cutover; snapshots antes/después de cada cutover, conservados 90 días. Si hace falta rollback, ejecutarlo sin dudar — un rollback lento casi siempre cuesta más que una migración retrasada.

## 7. Checklist pre-migración

Antes del primer canary: entorno heredado documentado; cluster Kubernetes reflejado sobre la red heredada; migración de datos StatefulSet ensayada sobre una copia de producción; job de reconciliación limpio durante tres noches; cuatro señales de oro instrumentadas; procedimiento de rollback probado en menos de cinco minutos; rotación on-call cubierta; página de estado lista.

## Cierre

Una migración Kubernetes sin tiempo de inactividad es una secuencia de pasos pequeños y reversibles, cada uno custodiado por datos, métricas y un rollback probado. Strangler Fig, datos sincronizados, desplazamiento de tráfico ponderado y observabilidad disciplinada producen una migración que los clientes nunca ven. Más en [DevOps CI/CD Modernization](/es/devops-cicd-modernization/).