1. In WordPress auf der leeren Seite auf das `+` klicken.
2. Nach `Custom HTML` suchen und den Block einfuegen.
3. Den kompletten Inhalt aus `portfolio-site/wordpress-paste-snippet.html` dort hineinkopieren.
4. Auf `Vorschau` klicken und pruefen, ob das Layout erscheint.
5. Danach den Platzhalter `BILD HIER EINSETZEN` ersetzen:
   - entweder direkt im HTML durch ein `<img src="DEINE-WORDPRESS-BILD-URL" alt="Valentin Strasser">`
   - oder den Bildbereich spaeter mit einem WordPress-Bildblock ersetzen.
6. `DEINE-EMAIL-HIER` und `DEINE-NUMMER-HIER` ersetzen.
7. Seite veroeffentlichen.

Wichtig:
- In einem normalen Absatzblock funktioniert das nicht. Es muss ein `Custom HTML`-Block sein.
- Diese Version ist absichtlich ohne JavaScript gebaut, damit WordPress nichts wegfiltert.
- Wenn die Seite den normalen WordPress-Header/Footer behalten soll, ist das okay. Wenn du eine cleanere Landingpage willst, stelle in Kadence moeglichst auf `Full Width` und blende den Seitentitel aus.
