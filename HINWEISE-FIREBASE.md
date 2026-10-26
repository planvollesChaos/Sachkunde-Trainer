# Hinweise zu Firebase (für Nancy)

## Kurz: Du musst nichts ändern

Der Sachkunde-Trainer benutzt dasselbe Firebase-Projekt (`vokabeln-ca1d7`) und denselben
Familiencode wie die Vokabel-App. Er legt seine Daten in **eigenen Dokumenten** ab:

| App | Dokumente (unter `families/<Familiencode>/profiles/`) |
|---|---|
| Vokabel-App | `kid-ellena`, `kid-merle`, `kid-eltern` |
| Sachkunde-Trainer | `sk-ellena`, `sk-merle`, `sk-eltern` |

Die Vokabel-App liest nur ihre eigenen drei Dokumente und ignoriert die `sk-...`-Dokumente.
Der Sachkunde-Trainer macht es umgekehrt. Die Daten mischen sich also nicht.

Warum keine Regeländerung nötig ist: Die Regeln in `vokabeltrainer/firestore.rules` erlauben
nur den Pfad `families/{fam}/profiles/{pid}` und nur die Felder `name, role, avatar, p, u`.
Eine neue Sammlung (zum Beispiel `families/<Code>/sachkunde/...`) wäre dort **gesperrt**.
Deshalb nutzt der Sachkunde-Trainer bewusst denselben Pfad mit einer anderen Dokument-Nummer
(`sk-...`) und genau diese fünf Felder. Das ist mit den jetzigen Regeln erlaubt (getestet mit
einem Test-Familiencode, alle Testdokumente danach wieder gelöscht).

Es wurde in Firebase selbst nichts verändert.

## Wenn im Eltern-Bereich „Abgleich fehlgeschlagen (HTTP 403)" steht

Dann sind die Regeln in der Konsole vermutlich nicht dieselben wie in der Datei `firestore.rules`
(zum Beispiel alte Regeln, die nur `kid-...` erlauben). So prüfst du das, Schritt für Schritt:

1. Im Browser auf https://console.firebase.google.com gehen und mit deinem Google-Konto anmelden.
2. Das Projekt **vokabeln-ca1d7** anklicken.
3. Links im Menü auf **Firestore Database** klicken (unter „Erstellen" oder „Build").
4. Oben auf den Reiter **Regeln** klicken.
5. Dort steht ein Textfeld. Vergleiche den Text mit der Datei
   `C:\Users\nancy\Schule\vokabeltrainer\firestore.rules`.
   Er muss so aussehen (die Zeilen mit `//` sind nur Kommentare):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /families/{fam}/profiles/{pid} {
         allow read, delete: if fam.size() >= 20;
         allow create, update: if fam.size() >= 20
           && request.resource.data.keys().hasOnly(['name', 'role', 'avatar', 'p', 'u'])
           && request.resource.data.name is string
           && request.resource.data.name.size() <= 30;
       }
     }
   }
   ```
6. Steht dort etwas anderes (zum Beispiel `pid.matches('kid-.*')`), den ganzen Text im Feld
   markieren (Strg + A), löschen und den Text von oben einfügen.
7. Oben rechts auf **Veröffentlichen** klicken. Nach ein paar Sekunden gilt die Regel.
8. Im Sachkunde-Trainer: Eltern-Bereich → ⚙️ Einstellungen → „🔄 Jetzt abgleichen".
   Es sollte „✓ Verbunden · zuletzt abgeglichen …" erscheinen.

## Wenn du später eine echt getrennte Sammlung willst (nicht nötig)

Dann müsste in der Regel-Datei zusätzlich dieser Block stehen (unter dem `profiles`-Block,
innerhalb von `match /databases/{database}/documents { ... }`), und der Sachkunde-Trainer
müsste im Code auf `.../families/<Code>/sachkunde/...` umgestellt werden:

```
match /families/{fam}/sachkunde/{pid} {
  allow read, delete: if fam.size() >= 20;
  allow create, update: if fam.size() >= 20
    && request.resource.data.keys().hasOnly(['name', 'role', 'avatar', 'p', 'u'])
    && request.resource.data.name is string
    && request.resource.data.name.size() <= 30;
}
```

Das Einfügen geht genauso wie oben (Schritte 1 bis 7). Sag mir Bescheid, dann stelle ich den Code um.

## Sonstiges

- Der Familien-Link (`...#fam=CODE`) funktioniert auch für den Sachkunde-Trainer. Wenn beide Apps
  auf derselben Internetadresse (Domain) liegen, übernimmt der Sachkunde-Trainer den Code der
  Vokabel-App automatisch, wenn das Gerät dort schon verbunden ist.
- Gespeichert wird online nur: Profilname, Häschen, Lernstand (gekonnte Karten, Quiz-Ergebnisse,
  Probe-Arbeit, Lernzeit pro Tag), Spiel-Rekorde und die Spiel-Einstellung.
- Der Firebase-Web-Schlüssel steht im Code (wie in der Vokabel-App, das ist gewollt).
  Der Schutz kommt vom langen Familiencode und den Regeln.
