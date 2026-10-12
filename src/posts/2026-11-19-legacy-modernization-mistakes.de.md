---
layout: post.liquid
title: "5 Legacy-Modernisierungsfehler, die Ihr Budget verbrennen"
description: "Die meisten Modernisierungsprojekte überschreiten das Budget um das 2–3-fache. Die Muster sind vorhersehbar. So erkennen Sie sie, bevor sie Sie kosten."
date: 2026-11-19
permalink: /de/blog/2026-11-19-legacy-modernization-mistakes/
---

# 5 Legacy-Modernisierungsfehler, die Ihr Budget verbrennen

Die meisten Enterprise-Modernisierungsprojekte überschreiten das Budget um das 2–3-fache. Nicht weil die Technologie schwer ist — sondern weil die Muster vorhersehbar sind und niemand Schutzmaßnahmen dagegen aufbaut.

Das sind die fünf Fehler, die ich wiederholt sehe. Wenn Sie eine Modernisierung starten, bauen Sie explizite Abwehrmaßnahmen gegen jeden.

## Fehler 1: Big-Bang-Rewrite

Der größte Vorhersagewert für Misserfolg ist der „Rewrite from Scratch"-Ansatz. Das Team entscheidet, dass das Legacy-System nicht reparierbar ist, committet 18 Monate für den Neubau und entdeckt auf halbem Weg, dass das Legacy-System 200 undokumentierte Geschäftsregeln enthielt. Der Rewrite wird 30 Monate zu spät ausgeliefert, 2x über Budget und verfehlt 40 % der Funktionen, die „niemand nutzt" (was die Leute aber taten).

**Die Lösung:** Strangler-Fig-Pattern. Bauen Sie das neue System neben dem Legacy-System. Migrieren Sie einen Workflow nach dem anderen. Jede Migration ist klein, reversibel und messbar.

## Fehler 2: Datenmigration unterschätzt

Jedes Team denkt, Datenmigration sei 20 % des Projekts. Es sind tatsächlich 50 %. Das Legacy-System hat Datenqualitätsprobleme, die Sie nie gesehen haben. Das neue Schema benötigt Transformationen, die niemand geplant hat. Feld-Mappings sind falsch. Historische Daten haben Edge Cases, die in Ihren Testdaten nicht existierten.

**Die Lösung:** Verbringen Sie den ersten Monat des Projekts mit Daten-Audit, nicht Code. Bauen Sie Datenqualitäts-Dashboards. Führen Sie mehrere vollständige Migrationen durch.

## Fehler 3: Keine klare Stop-Bedingung

Die meisten Modernisierungsprojekte haben keine Definition von „fertig". Sie haben ein Ziel wie „das Abrechnungssystem modernisieren" und fahren dann fort. Das Team erweitert den Scope kontinuierlich. Das Budget wächst. Drei Jahre später ist das System 60 % modernisiert und kein Ende in Sicht.

**Die Lösung:** Definieren Sie den Modernisierungs-Scope als Liste von Capabilities, nicht als System. Jede Capability hat einen klaren „modernisiert"-Zustand. Migration stoppt, wenn alle Capabilities modernisiert sind.

## Fehler 4: Team-Fähigkeit unterinvestiert

Modernisierung erfordert andere Fähigkeiten als Legacy-Wartung. Neue Architekturen, neue Tools, neue Muster. Teams, die 10 Jahre COBOL oder 15 Jahre alten Java gewartet haben, haben diese Fähigkeiten nicht.

**Die Lösung:** Stellen Sie 1–2 Senior-Engineers mit tiefer Erfahrung im Ziel-Stack ein, bevor das Projekt startet. Paaren Sie sie mit dem Legacy-Team für Wissenstransfer.

## Fehler 5: Die User-Experience-Lücke ignorieren

Das Legacy-System hat 15 Jahre kleiner UX-Anpassungen, die niemand dokumentiert hat. Power-User haben Workflows um Quirks im Legacy-UI gebaut. Das neue System ist „sauberer", bricht aber diese Workflows. Benutzer revoltieren. Adoption stagniert. Das Projekt ist technisch erfolgreich, aber organisatorisch ein Fehlschlag.

**Die Lösung:** Benutzerforschung vor, während und nach der Modernisierung. Dokumentieren Sie die Legacy-UX-Quirks. Führen Sie Usability-Tests mit echten Power-Usern durch, nicht nur freundlichen.

## Das Muster

Alle fünf Fehler teilen ein Muster: die Kosten des Übergangs unterschätzen, den Wert der sauberen Tafel überschätzen. Die erfolgreichen Modernisierungen, die ich sehe, behandeln das Legacy-System als Feature, nicht als Bug. Sie migrieren sorgfältig, messen kontinuierlich und halten die Lichter an, während sie die Zukunft bauen.
