---
layout: post.liquid
title: "Monolito vs microservicios: marco de decisión pragmático para mid-market"
description: "El debate monolito vs microservicios está agotado. Aquí va un marco de decisión que elige la arquitectura correcta a partir de cuatro entradas: tamaño de equipo, patrones de tráfico, edad del sistema y posición en el ciclo de vida."
date: 2026-12-17
author: barannayir
tags: [monolito, microservicios, arquitectura, kubernetes, dotnet]
category: Arquitectura
image: /assets/images/blog/2026-12-17-monolith-vs-microservices.png
i18n_key: monolith-vs-microservices
permalink: /es/blog/2026-12-17-monolith-vs-microservices/
---

# Monolito vs microservicios: marco de decisión pragmático para mid-market

El debate "monolito vs microservicios" está agotado en la literatura y aún más en la práctica. Cada ingeniero senior tiene una opinión, la mayoría modelada por la arquitectura que les quemó la última vez. Este artículo no es otra opinión. Es un marco de decisión que escoge la arquitectura correcta a partir de cuatro entradas.

Usamos este marco con clientes de [modernización de software empresarial](/es/enterprise-software-modernization/). El resultado rara vez son microservicios.

## Las cuatro entradas

**Tamaño de equipo.** Un equipo de 5 ingenieros no puede operar 10 servicios. El umbral de rentabilidad para ir a microservicios se sitúa en torno a 15–20 ingenieros trabajando sobre el mismo sistema.

**Patrones de tráfico.** Los microservicios brillan cuando distintas partes del sistema tienen perfiles de carga radicalmente diferentes. Si su sistema tiene una carga aproximadamente uniforme entre módulos, los microservicios añaden coste sin beneficio.

**Edad del sistema.** Un proyecto greenfield es el lugar correcto para elegir microservicios deliberadamente. Un sistema existente es el lugar equivocado. La mayoría de conversaciones "tenemos que romper nuestro monolito" son realmente conversaciones "nuestro monolito está mal organizado".

**Posición en el ciclo de vida.** Un sistema en desarrollo activo durante los próximos 3+ años se beneficia de microservicios si el equipo es suficientemente grande.

## Lo que los monolitos hacen bien

Los monolitos modernos — unidad de despliegue única, arquitectura interna modular, límites de módulo claros — son sistemas excelentes para el 80% de aplicaciones de negocio que encajan en el perfil. Son:

- Más fáciles de depurar
- Más fáciles de desplegar
- Más fáciles de probar
- Más baratos de operar

Un monolito .NET bien construido con límites de módulo claros superará a un sistema de microservicios mal arquitectado.

## Lo que los microservicios hacen bien

Los microservicios resuelven problemas específicos:

- Despliegue independiente de subsistemas
- Escalado independiente
- Autonomía de equipo
- Diversidad tecnológica

Si no tiene estos problemas, no necesita microservicios.

## La ruta de migración (cuando los microservicios son la respuesta correcta)

1. Empiece con un monolito bien modularizado.
2. Extraiga un servicio cada vez.
3. Use Kubernetes solo tras 3+ servicios.
4. Adopte una service mesh solo tras 8+ servicios.
5. Estandarice en .NET y un número pequeño de runtimes.

La mayor parte de lo que hacemos al [ayudar a mid-market](/es/b2b-software-services/) a romper monolitos sigue este camino.

## Cierre

La arquitectura correcta depende del tamaño de equipo, patrones de tráfico, edad del sistema y posición en el ciclo de vida. Para la mayoría de las mid-market, la respuesta es un monolito bien construido.

Para una pregunta relacionada — cuándo migrar a la nube en primer lugar — vea nuestra [checklist de migración a la nube](/es/blog/2026-12-03-cloud-migration-checklist/). Para la pregunta más profunda de cuándo mantener un sistema heredado y cuándo modernizar, vea [trampas de la modernización legacy](/es/legacy-modernization/).