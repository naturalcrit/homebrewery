```css
h5 {
	font-size: .35cm !important;
}

.taskList li {
	list-style-type : none;
}

.taskList li input {
	margin-left : -0.52cm;
	transform: translateY(.05cm);
	filter: brightness(1.1) drop-shadow(1px 2px 1px #222);
}

.taskList li input[checked] {
	filter: sepia(100%) hue-rotate(60deg) saturate(3.5) contrast(4) brightness(1.1) drop-shadow(1px 2px 1px #222);
}

pre + * {
	margin-top: 0.17cm;
}

pre {
	margin-top: 0.17cm;
}

.page pre code {
	word-break:break-word;
}

.page p + pre {
	margin-top : 0.1cm;
}

.page h1 + p:first-letter {
	all:unset;
}

.page .toc ul {
	margin-top:0;
}

.page h3 {
	font-family:inherit;
	font-size:inherit;
	border:inherit;
	margin-top:12px;
	margin-bottom:5px
}

.page h3:before {
	content:'Q.';
	position:absolute;
	font-size:2em;
	margin-left:-1.2em;	
}

.page .columnSplit + h3 {
	margin-top:0;
}
```

# FAQ
{{wide Updated Oct. 11, 2021}}


### Die Seite ist offline! Nur bei mir?

Du kannst den Online-Status der Seite hier überprüfen: [Everyone or Just Me](https://downforeveryoneorjustme.com/brauerei.ilaris-online.de)

### Wie melde ich mich an?

Garnicht. Das heißt nicht direkt. Wenn du im selben Browser bei ilaris-online.de angemeldet bist, besteht die Möglichkeit die Links zum bearbeiten und anzeigen deiner Gebräue im Account zu speichern. Die projekte selbst liegen allerdings in einer seperaten Datenkbank und werden nicht auf ilaris online gespeichert. Dir stehen alle Funktionen auch ohne account zur Verfügung, indem du dir den Link zum bearbeiten abspeicherst. Jeder mit diesem Link kann das Gebräu bearbeiten.

### Ich hab ewig an meinem Gebräu gearbeitet und plötzlich ist alles weg!

Das passiert normalerweise wenn du versehentlich alles markiert hast und dann etwas getippt hast. Wenn du autosafe aktiviert hast, lade nicht die Seite neu! Keine Panik. Solange das Textfeld noch offen ist, kann der Browser die letzten eingaben rückgängig machen, wenn du entsprechend oft STR+Z drückst. Wenn es wieder in einem guten Zustand ist speichere es einmal manuell.

\column

### Warum ist nur Chrome supported?

Verschiedene Browser haben verschiedene Möglichkeiten, für das Layout (CSS). Firefox zumbeispiel, hat Schwierigkeiten mit manuellen Spaltenumbrüchen. Da wir in einem Hobbyprojekt nicht genügend Zeit haben perfekte Lösungen für jeden Browser zu erarbeiten, fokussieren wir uns auf den kostenlosen Chrome Browser. Was nicht heißt, dass die Website in Zukunft nicht auch in anderen modernen Browsern funktionieren kann, wenn sie die entsprchenden Fähigkeiten in den nächsten Updates nachrüsten.

### Warum muss ich manuell Seiten und Spalten umbrechen?

Ein Dokument oder Gebräu aus der Ilaris-Brauerei ist letztendlich ein HTML Dokument mit entsprechenden CSS, die das ganze wie ein Textdokument aussehen lassen (A4, Seitenränder, etc.. ). Das erleichtert das Anzeigen und bearbeiten im Browser, hat aber auch zur Folge, dass die Funktionen etwas eingeschränkter sind als die eines Textverarbeitungsprogrammes, das Wörter automatisch auf die passende Seite schreibt. Die manuellen Umbrüche sind unserer Meinung nach aber ein kleiner Preis, für die vielen Vorteile, die die Brauerei bietet.

### Woher bekomme ich Bilder?

Wir stellen einige Bilder über ilaris-online.de bereit (TODO: Link/Example), die ausschließlich für nicht-komerzielle Projekte mit Ilaris bezug verwendet werden dürfen (TODO: Details). Du kannst aber eigene Bilder zB auf [Imgur](https://www.imgur.com) hochladen und die url zum Bild dann benutzen um beliebige Bilder in deinem Gebräu anzuzeigen. Bitte achte selbstständig darauf, dass du entsprechende Rechte hast, das Bild zu verwenden.

\page

### A particular font does not work for my language, what do I do?
TODO: Font issues?

### PDF Speichern zeigt mir nur den Druck-Dialog an statt es herunterzuladen.

Das ist richtig und beabsichtigt. Wir benutzen diesen Schritt um aus der angezeigten Version (HTML) eine PDF Datei zu erzeugen, die ggf. deutlich mehr Speicherplatz braucht. Im Druckfenster solltest du den Button "Als PDF speichern" finden und kannst dann auswählen wo und unter welchem Namen die fertige Datei auf deinem Computer gespeichert wird. Auf Ilaris-Online wird nur der Quelltext (linke Seite des Editors) gespeichert.

### The preview window is suddenly gone, I can only see the editor side of the Homebrewery (or the other way around).

TODO: 

1. Press `CTRL`+`SHIFT`+`i` (or right-click and select "Inspect") while in the Homebrewery.

2. Expand...
```
	- `body` 
	- `main`
	- `div class="homebrew"`
	- `div class="editPage page"`
	- `div class="content"`
	- `div class="splitPane"`
```

There you will find 3 divs: `div class="pane" [...]`, `div class="divider" [...]`, and `div class="pane" [...]`.

The `class="pane"` looks similar to this: `div class="pane" data-reactid="36" style="flex: 0 0 auto; width: 925px;"`.

Change whatever stands behind width: to something smaller than your display width. 

### I have white borders on the bottom/sides of the print preview.

The Homebrewery paper size and your print paper size do not match.

The Homebrewery defaults to creating US Letter page sizes.  If you are printing with A4 size paper, you must add the "A4 Page Size" snippet.  In the "Print" dialog be sure your Paper Size matches the page size in Homebrewery.


### Typing `#### Adhesion` in the text editor doesn't show the header at all in the completed page?

TODO: 

Your ad-blocking software is mistakenly assuming your text to be an ad. Whitelist homebrewery.naturalcrit.com in your ad-blocking software.