---
layout: post.liquid
title: "5 legacy-moderniseringsfouten die uw budget verbranden"
description: "De meeste moderniseringsprojecten overschrijden het budget met 2-3×. De patronen zijn voorspelbaar. Zo herkent u ze voordat ze u geld kosten."
date: 2026-11-19
permalink: /nl/blog/2026-11-19-legacy-modernization-mistakes/
---

# 5 legacy-moderniseringsfouten die uw budget verbranden

De meeste enterprise-moderniseringsprojecten overschrijden het budget met 2-3×. Niet omdat de technologie moeilijk is — maar omdat de patronen voorspelbaar zijn en niemand er bescherming tegen bouwt.

Dit zijn de vijf fouten die ik herhaaldelijk zie. Als u een modernisering start, bouw dan expliciete verdedigingen tegen elke fout.

## Fout 1: Big-Bang-rewrite

De grootste voorspeller van falen is de "rewrite from scratch"-benadering. Het team besluit dat het legacy-systeem onherstelbaar is, commit zich aan 18 maanden herbouw, en ontdekt halverwege dat het legacy-systeem 200 ongedocumenteerde bedrijfsregels bevatte. De rewrite wordt 30 maanden te laat opgeleverd, 2× boven budget, en mist 40% van de functionaliteit die "niemand gebruikt" (maar die mensen wel gebruikten).

**De oplossing:** Strangler Fig-patroon. Bouw het nieuwe systeem naast het legacy-systeem. Migreer één workflow per keer. Elke migratie is klein, omkeerbaar en meetbaar.

## Fout 2: Datamigratie onderschatten

Elk team denkt dat datamigratie 20% van het project is. Het is eigenlijk 50%. Het legacy-systeem heeft datakwaliteitsproblemen die u nooit hebt gezien. Het nieuwe schema vereist transformaties die niemand heeft gepland. Veldmappings zijn verkeerd. Historische gegevens hebben edge cases die niet bestonden in uw testgegevens.

**De oplossing:** Besteed de eerste maand van het project aan data-audit, niet aan code. Bouw datakwaliteitsdashboards. Voer meerdere volledige migraties uit.

## Fout 3: Geen duidelijke stopconditie

De meeste moderniseringsprojecten hebben geen definitie van "klaar". Ze hebben een doel als "moderniseer het facturatiesysteem" en gaan dan eindeloos door. Het team voegt continu scope toe. Het budget groeit. Drie jaar later is het systeem 60% gemoderniseerd en is er geen einde in zicht.

**De oplossing:** Definieer de moderniseringsscope als een lijst van capabilities, niet als een systeem. Elke capability heeft een duidelijke "gemoderniseerde" staat. Migratie stopt wanneer alle capabilities zijn gemoderniseerd.

## Fout 4: Te weinig investeren in teamcapaciteit

Modernisering vereist andere vaardigheden dan legacy-onderhoud. Nieuwe architecturen, nieuwe tools, nieuwe patronen. Teams die 10 jaar COBOL of 15 jaar oude Java hebben onderhouden, hebben deze vaardigheden niet.

**De oplossing:** Huur of contracteer 1-2 senior engineers met diepe ervaring in de doelstack in voordat het project begint. Koppel ze met het legacy-team voor kennisoverdracht.

## Fout 5: De kloof in gebruikerservaring negeren

Het legacy-systeem heeft 15 jaar kleine UX-aanpassingen die niemand heeft gedocumenteerd. Power users hebben workflows gebouwd rond eigenaardigheden in de legacy-UI. Het nieuwe systeem is "schoner" maar breekt die workflows. Gebruikers rebelleren. Adoptie stagneert. Het project is technisch succesvol maar organisatorisch een mislukking.

**De oplossing:** Gebruikersonderzoek voor, tijdens en na. Documenteer de legacy-UX-eigenaardigheden. Voer usability-tests uit met echte power users, niet alleen vriendelijke.

## Het patroon

Alle vijf fouten delen een patroon: de kosten van de transitie onderschatten, de waarde van de schone lei overschatten. De succesvolle moderniseringen die ik zie behandelen het legacy-systeem als een feature, niet als een bug. Ze migreren zorgvuldig, meten continu, en houden de lichten aan terwijl ze de toekomst bouwen.
