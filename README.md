# Ελληνικά

Persoonlijke web-app om in zes maanden Grieks te leren: alfabet, getallen en 1000 woorden in korte lessen, met gespreide herhaling en toetsen. Geen account, geen server; alle voortgang staat lokaal op het toestel.

## Op je telefoon zetten

1. Zet GitHub Pages aan: Settings > Pages > Deploy from a branch > kies de branch en map `/ (root)`. Op een gratis account moet de repository daarvoor public zijn.
2. Open de Pages-link in Chrome op Android.
3. Menu (drie puntjes) > Toevoegen aan startscherm > Installeren.

## Opbouw

- `data-core.js`: alfabet, getallen en hulpfuncties voor de inhoud
- `data-a1.js`, `data-a2.js`: woordenschat en voorbeeldzinnen per thema (één regel per woord: `grieks | nederlands`)
- `data-extra.js`: werkwoordsvervoegingen en gesprekken
- `data-fun.js`: plaatjes, ezelsbruggetjes en kaartjes met uitdrukkingen
- `app.js`: lessen, herhaling, toetsen, spraak en schermen
- `sw.js`: offline-cache. Verhoog `CACHE` na een wijziging als je die direct wilt zien.

Woorden toevoegen of verbeteren kan door een regel in een databestand aan te passen; de lessen worden daar automatisch uit opgebouwd.
