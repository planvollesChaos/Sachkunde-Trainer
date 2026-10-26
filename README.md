# Sachkunde-Trainer (Klassenarbeit 10.11.: Verkehr und Wald)

Lernseite für die Kinder, gebaut aus den Fotos von Schulbuch, Arbeitsheft, Kopiervorlagen und Prüfbogen.

- `index.html`, `app.js`: die Seite (Lernkarten, Quiz, Probe-Arbeit, Lernzettel, Bibliothek)
- `daten.js`: alle Karten und Fragen (hier ändern oder ergänzen)
- `seiten.js`: Liste der zugeschnittenen Seiten
- `seiten/` (groß) und `seiten/klein/` (Vorschau): die zugeschnittenen Bilder
- `original/`: die Original-Fotos (nur lokal, nicht veröffentlichen)
- `build/`: Skripte zum Zuschneiden (`crop.js`, `post.js`), brauchen das Node-Paket `sharp`

Test lokal: kleinen Webserver auf diesen Ordner starten, Seite im Browser öffnen.
Lernstand liegt im Browser; der Abgleich der Geräte läuft über Firebase (siehe HINWEISE-FIREBASE.md).
