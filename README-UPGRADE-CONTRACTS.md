README-UPGRADE-CONTRACTS.md
Stand: 2025-08-29 08:28

Kopieren/Ersetzen:
- modules/contracts/index.html (überschreiben)
- modules/customers/index.html (neu hinzufügen)

Danach in der Shell-Navigation einen Link einfügen:
<a href="#" data-target="./modules/customers/index.html">Kunden (Liste)</a>
# README – Contracts Upgrade (Stand: 2025-08-30)

## Was wurde geändert
- Einheitlicher Save-Flow: Verträge nutzen `dfsCloud.saveOne('dfs.contracts', id, payload)`.
- Term-Berechnungen:
  - `endDate = startDate + termYears`
  - `reminderDate = startDate + 3 Jahre − 3 Monate`
  - `cancelableFrom` automatisch gesetzt (mind. 3 Monate vor Ablauf).
- Status-Maschine (saving/saved/error) inkl. Retry & Spinner-Reset.
- Dashboard-Reminder: 90/60/30-Listen + Summen (Umsätze zu sichern).

## Nutzung
- Neuer Vertrag: Button auf Kunden-Detail (customerId vorbelegt).
- Validierung: Pflichtfelder Versicherer, Police, PaymentMode, Premium, Start, Term.

## Bekannte Punkte
- Indizes anlegen (siehe TECH-SPEC).
- UI: Warnhinweise bei bald ablaufenden Verträgen farblich verstärken.

## Nächste Schritte
- Sammelaktionen (mehrere Verträge markieren → Export/Notiz).
- „Fokus-Kunden“ im Dashboard: Top 5 nach `reminderDate` und Volumen.
