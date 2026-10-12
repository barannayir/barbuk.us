---
layout: post.liquid
title: "5 errori di modernizzazione legacy che bruciano il vostro budget"
description: "La maggior parte dei progetti di modernizzazione sfora il budget di 2-3×. I pattern sono prevedibili. Ecco come individuarli prima che vi costino."
date: 2026-11-19
permalink: /it/blog/2026-11-19-legacy-modernization-mistakes/
---

# 5 errori di modernizzazione legacy che bruciano il vostro budget

La maggior parte dei progetti di modernizzazione enterprise sfora il budget di 2-3×. Non perché la tecnologia è difficile — ma perché i pattern sono prevedibili e nessuno costruisce protezioni contro di essi.

Questi sono i cinque errori che vedo ripetutamente. Se state iniziando una modernizzazione, costruite difese esplicite contro ciascuno.

## Errore 1: Rewrite big-bang

Il più grande predittore di fallimento è l'approccio "rewrite from scratch". Il team decide che il sistema legacy è irreparabile, si impegna per 18 mesi a ricostruirlo, e scopre a metà strada che il sistema legacy conteneva 200 regole business non documentate. Il rewrite viene consegnato 30 mesi in ritardo, 2× oltre il budget, e manca il 40% delle funzionalità che "nessuno usa" (ma che le persone usavano).

**La soluzione:** Pattern Strangler Fig. Costruite il nuovo sistema accanto a quello legacy. Migra un workflow alla volta. Ogni migrazione è piccola, reversibile e misurabile.

## Errore 2: Sottovalutare la migrazione dei dati

Ogni team pensa che la migrazione dei dati sia il 20% del progetto. In realtà è il 50%. Il sistema legacy ha problemi di qualità dei dati che non avete mai visto. Il nuovo schema richiede trasformazioni che nessuno ha pianificato. I mapping dei campi sono sbagliati. I dati storici hanno edge case che non esistevano nei vostri dati di test.

**La soluzione:** Trascorrete il primo mese del progetto sull'audit dei dati, non sul codice. Costruite dashboard di qualità dei dati. Eseguite più migrazioni complete.

## Errore 3: Nessuna condizione di stop chiara

La maggior parte dei progetti di modernizzazione non ha una definizione di "finito". Hanno un obiettivo come "modernizzare il sistema di fatturazione" e poi procedono indefinitamente. Il team aggiunge scope continuamente. Il budget si espande. Tre anni dopo, il sistema è 60% modernizzato e non c'è fine in vista.

**La soluzione:** Definite lo scope di modernizzazione come una lista di capability, non un sistema. Ogni capability ha uno stato "modernizzato" chiaro. La migrazione si ferma quando tutte le capability sono modernizzate.

## Errore 4: Sottoinvestire nella capacità del team

La modernizzazione richiede competenze diverse dalla manutenzione legacy. Nuove architetture, nuovi tool, nuovi pattern. Team che hanno passato 10 anni a mantenere COBOL o 15 anni di Java vecchio non hanno queste competenze.

**La soluzione:** Assumete o ingaggiate 1-2 ingegneri senior con profonda esperienza nello stack target prima che il progetto inizi. Abbinateli con il team legacy per il trasferimento di conoscenze.

## Errore 5: Ignorare il gap di esperienza utente

Il sistema legacy ha 15 anni di piccoli accomodamenti UX che nessuno ha documentato. I power user hanno costruito workflow attorno alle stranezze dell'UI legacy. Il nuovo sistema è "più pulito" ma rompe quei workflow. Gli utenti si ribellano. L'adozione ristagna. Il progetto è tecnicamente riuscito ma organizzativamente un fallimento.

**La soluzione:** Ricerca utente prima, durante e dopo. Documentate le stranezze UX legacy. Eseguite test di usabilità con veri power user, non solo quelli amichevoli.

## Il pattern

Tutti e cinque gli errori condividono un pattern: sottovalutare il costo della transizione, sopravvalutare il valore della tabula rasa. Le modernizzazioni di successo che vedo trattano il sistema legacy come una feature, non un bug. Migrano con cura, misurano continuamente, e tengono le luci accese mentre costruiscono il futuro.
