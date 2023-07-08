/* eslint-disable max-lines */

const MagicGen           = require('./snippets/magic.gen.js');
const ClassTableGen      = require('./snippets/classtable.gen.js');
const MonsterBlockGen    = require('./snippets/monsterblock.gen.js');
const scriptGen          = require('./snippets/script.gen.js');
const ClassFeatureGen    = require('./snippets/classfeature.gen.js');
const CoverPageGen       = require('./snippets/coverpage.gen.js');
const TableOfContentsGen = require('./snippets/tableOfContents.gen.js');
const indexGen           = require('./snippets/index.gen.js');
const dedent             = require('dedent-tabs').default;



module.exports = [

	{
		groupName : 'Text Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'text',
		snippets  : [
			{
				name : 'Seitennummer',
				icon : 'fas fa-bookmark',
				gen  : '{{pageNumber 1}}\n{{footnote PART 1 | SECTION NAME}}\n\n'
			},
			{
				name : 'Selbstzählende Seitennummer',
				icon : 'fas fa-sort-numeric-down',
				gen  : '{{pageNumber,auto}}\n{{footnote PART 1 | SECTION NAME}}\n\n'
			},
			{
				name : 'Inhaltsverzeichnis',
				icon : 'fas fa-book',
				gen  : TableOfContentsGen
			},
			{
				name         : 'Kopfzeile',
				icon         : 'fas fa-minus',
				gen          : function() {
					return dedent`
					{{kopfzeile Dies ist eine Kopfzeile}}`
				},
			},
			{
				name         : 'Fußzeile',
				icon         : 'fas fa-minus',
				gen          : function() {
					return dedent`
					{{fusszeile Dies ist eine Fußzeile}}`
				},
			},
			{
				name         : 'Index',
				icon         : 'fas fa-bars',
				gen          : indexGen,
				experimental : true
			}
		]
	},
	{
		groupName : 'Style Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'style',
		snippets  : [
			{
				name : 'Remove Drop Cap',
				icon : 'fas fa-remove-format',
				gen  : dedent`/* Removes Drop Caps */
						.page h1+p:first-letter {
							all: unset;
						}\n\n
						/* Removes Small-Caps in first line */
						.page h1+p:first-line {
							all: unset;
						}`
			},
			{
				name : 'Tweak Drop Cap',
				icon : 'fas fa-sliders-h',
				gen  : dedent`/* Drop Cap settings */
						.page h1 + p::first-letter {
							font-family: SolberaImitationRemake;
							font-size: 3.5cm;
							background-image: linear-gradient(-45deg, #322814, #998250, #322814);
							line-height: 1em;
						}\n\n`
			}
		]
	},

	/*********************** IMAGES *******************/
	{
		groupName : 'Grafiken',
		icon      : 'fas fa-images',
		view      : 'text',
		snippets  : [
			{
				name : 'Bild',
				icon : 'fas fa-image',
				gen  : dedent`
					![cat warrior](https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg) {width:325px,mix-blend-mode:multiply}

					{{artist,position:relative,top:-230px,left:10px,margin-bottom:-30px
					##### Cat Warrior
					[Kyoung Hwan Kim](https://www.artstation.com/tahra)
					}}`
			},
			{
				name : 'Hintergrundbild',
				icon : 'fas fa-tree',
				gen  : dedent`
					![homebrew mug](http://i.imgur.com/hMna6G0.png) {position:absolute,top:50px,right:30px,width:280px}

					{{artist,top:80px,right:30px
					##### Homebrew Mug
					[naturalcrit](https://homebrew.naturalcrit.com)
					}}`
			},
			{
				name : 'Wasserzeichen',
				icon : 'fas fa-id-card',
				gen  : dedent`
				{{watermark Ilaris}}\n`
			},
		]
	},

	/************************* ILARIS ********************/
	{
		groupName : 'Ilaris',
		icon      : 'fas fa-book',
		view      : 'text',
		snippets  : [
			{
				name : 'Versalie',
				icon : 'fas fa-square-h',
				gen  : function() {
					return '{{versalie A}}';
				},
			},
			{
				name : 'Zauber',
				icon : 'fas fa-magic',
				gen  : MagicGen.spell,
			},
			{
				name : 'Zauberliste',
				icon : 'fas fa-scroll',
				gen  : MagicGen.spellList,
			},
			{
				name : 'Klassenfähgikeit',
				icon : 'fas fa-mask',
				gen  : ClassFeatureGen,
			},
			{
				name : 'Notiz',
				icon : 'fas fa-sticky-note',
				gen  : function(){
					return dedent`
						{{note
						##### Time to Drop Knowledge
						Use notes to point out some interesting information.

						**Tables and lists** both work within a note.
						}}
						\n`;
				},
			},
			{
				name : 'Textbox',
				icon : 'fas fa-comment-alt',
				gen  : function(){
					return dedent`
						{{descriptive
						##### Time to Drop Knowledge
						Use descriptive boxes to highlight text that should be read aloud.

						**Tables and lists** both work within a descriptive box.
						}}
						\n`;
				},
			},
			{
				name : 'Kasten - Brief',
				icon : 'fa-solid fa-envelope',
				gen  : function(){
					return dedent`
					{{kasten,handschrift
					Edle Helden,
					<br>
					warum in die Ferne schweifen, wenn das größte Abenteuer direkt vor eurer Nase liegt.
					
					{{rechtsbuendig -- Niemand}}
					}}
					\n`;
				},
			},
			{
				name : 'Kreatur',
				icon : 'fas fa-paw',
				gen  : MonsterBlockGen.creature(),
				experimental : true
			},
			{
				name : 'NSC',
				icon : 'fas fa-user-secret',  // fa-masks-theater
				gen  : MonsterBlockGen.humanoid(),
			},
			{
				name : 'Artefakt',
				icon : 'fas fa-hat-wizard',
				gen  : MagicGen.item,
			},
			{
				name : 'Künstler Credit',
				icon : 'fas fa-signature',
				gen  : function(){
					return dedent`
						{{artist,top:90px,right:30px
						##### Starry Night
						[Van Gogh](https://www.vangoghmuseum.nl/en)
						}}
						\n`;
				},
			},
			{
				name: 'Ulisses Disclaimer',
				icon: 'fas fa-signature',
				gen : function () {
					return dedent`
					{{credit
					#### Artwork © ${new Date().getFullYear()} Ulisses Spiele.  
					DAS SCHWARZE AUGE, AVENTURIEN, DERE, MYRANOR, THARUN, UTHURIA, RIESLAND 
					und THE DARK EYE sind eingetragene Marken der Ulisses Spiele GmbH, Waldems. 
					Die Verwendung der Grafiken erfolgt unter den von Ulisses Spiele erlaubten Richtlinien. 
					Eine Verwendung über diese Richtlinien hinaus darf nur nach vorheriger schriftlicher 
					Genehmigung der Ulisses Medien und Spiel Distribution GmbH erfolgen.
					}}
					\n`;
				},
			}
		]
	},

	/*********************  TABLES *********************/
	{
		groupName : 'Tabellen',
		icon      : 'fas fa-table',
		view      : 'text',
		snippets  : [
			{
				name : 'Klassentabelle',
				icon : 'fas fa-table',
				gen  : ClassTableGen.full('classTable,frame,decoration,wide'),
			},
			{
				name : 'Klassentabelle (randlos)',
				icon : 'fas fa-border-none',
				gen  : ClassTableGen.full('classTable,wide'),
			},
			{
				name : '1/2 Klassentabelle',
				icon : 'fas fa-list-alt',
				gen  : ClassTableGen.half('classTable,decoration,frame'),
			},
			{
				name : '1/2 Klassentabelle (randlos)',
				icon : 'fas fa-border-none',
				gen  : ClassTableGen.half('classTable'),
			},
			{
				name : '1/3 Klassentabelle',
				icon : 'fas fa-border-all',
				gen  : ClassTableGen.third('classTable,frame'),
			},
			{
				name : '1/3 Klassentabelle (randlos)',
				icon : 'fas fa-border-none',
				gen  : ClassTableGen.third('classTable'),
			},
			{
				name         : 'Runen',
				icon         : 'fas fa-language',
				gen          : scriptGen.dwarvish,
				experimental : true,
				subsnippets  : [
					{
						name : 'Zwergisch',
						icon : 'fac davek',
						gen  : scriptGen.dwarvish,
					},
					{
						name : 'Elfisch',
						icon : 'fac rellanic',
						gen  : scriptGen.elvish,
					},
					{
						name : 'Drachisch',
						icon : 'fac iokharic',
						gen  : scriptGen.draconic,
					},
				]
			},
		]
	},

	/*********************  Seiten *********************/
	{
		groupName : 'Seiten',
		icon      : 'fas fa-table',
		view      : 'text',
		snippets  : [
			{
				name         : 'Vorderseite - Vollbild',
				icon         : 'fac book-front-cover',
				gen          : CoverPageGen.front,
			},
			{
				name         : 'Vorderseite - Teilbild',
				icon         : 'fac book-part-cover',
				gen          : CoverPageGen.frontPart,
			},
			{
				name      		 : 'Rückseite - Teilbild',
				icon      		 : 'fac book-back-cover',
				gen       		 : CoverPageGen.backRight,
			},
			{
				name      		 : 'Rückseite - Bild oben',
				icon      		 : 'fac book-back-cover',
				gen       		 : CoverPageGen.backTop,
			},
			{
				name: 'Einzelkarte',
				icon: 'far fa-square',
				gen : function(){
					return dedent`
						\page
						{{einzelkarte}}
						{{karte
						#### Kartentitel
						##### Untertitel
						Kartentext oder Inhalte
						###### Fußzeile
						}}
						\n`;
				},
			},
			{
				name      		 : 'Karten (3x3)',
				icon      		 : 'fas fa-th',
				gen       		 : function() {
					return dedent`
						\page
						{{pageheader Karten}}
						{{karten}}
			
						{{karte,border-color:#000000
						#### Randfarben
						Benutze border-color: um den Rand zu färben.
						Farbcodes für Manöverkarten:
						- \`#000000\`: Proben & Profanes 
						- \`#632423\`: Gesundheit 
						- \`#984806\`: Kampf 
						- \`#5F4778\`: Magie 
						- \`#C19758\`: Karma 
						- \`#CB1C7C\`: Paktierer 
						- \`#5F4778\`: Zauber 
						- \`#C19758\`: Liturgien 
						- \`#CB1C7C\`: Anrufungen 
						}}
						
						{{karte,border:0px
						##### Randlose Karte
						Setze \`border:0px\` um den Rand der Karte wegzulassen.
						}}
						
						{{karte,
						#### Kartentitel
						##### Kartenuntertitel
						Kartentext oder Tabellen oder Bilder...
						Hier können auch andere Layoutelemente innerhalb einer Karte genutzt werden.
						###### Fußnote
						}}
						
						{{karte,border-color:#984806
						#### Kartentitel
						Text...
						###### Fußnote
						}}
						
						{{karte,
						#### Kartentitel
						##### Kartenuntertitel
						Kartentext oder Tabellen oder Bilder...
						###### Fußnote
						}}
						
						{{karte,
						#### Kartentitel
						Mit Bild...
						
						![cat warrior](/assets/ilaris/Kraeuterkopf.png) {position:absolute,left:0.7cm,bottom:1cm,width:80%,mix-blend-mode:multiply}
						
						
						###### Fußnote
						}}
						
						{{karte,border-color:#5F4778
						#### Kartentitel
						Text...
						###### Fußnote
						}}
						
						{{karte,
						#### Kartentitel
						Text...
						
						##### Tabelle auf Karte
						| Spezies | Hintergrund | Fähigkeiten |
						|:------------------|:-----:|:-----------------:|
						| Menschen                 | Krieger     | Schwertkampf, Taktik, Ausdauer                |
						| Elfen               | Magier     | Elementarmagie, Heilung, Illusion                |
						| Zwerge             | Krieger     | Hammerkampf, Schmiedekunst                |
						| Orks             | Berserker     | Raserei, Widerstand                |
						| Gnome            | Schurke     | Schleichen, Diebeskunst, Fallen entschärfen                |
						
						###### Fußnote
						}}
							
						
						{{karte,kleinertitel,kleinertext
						#### Sehr kleiner Kartentitel
						##### Mini-Untertitel
						Und äußerst kleiner Text...
						:
						In den weiten und magischen Landen erhob sich eine düstere Bedrohung, die das Gleichgewicht der Welt zu zerstören drohte. Verzweifelt versammelten sich tapfere Helden aus allen Ecken des Landes, bereit, sich der Herausforderung entgegenzustellen. 
						
						Gemeinsam durchstreiften sie gefährliche Wälder, uralte Verliese und unbekannte Reiche, um die Rätsel vergessener Artefakte zu lösen. In epischen Schlachten trafen sie auf mächtige Kreaturen und dunkle Magier, während sie ihre Entschlossenheit und Tapferkeit unter Beweis stellten. Schließlich erreichten sie den finsteren Meister des Bösen, um sich ihm in einem alles entscheidenden Kampf zu stellen.
						
						Mit vereinten Kräften gelang es den Helden, die Welt vor ihrem sicheren Untergang zu bewahren.
						###### Fußnote
						}}
						
						{{pageNumber ??}}
						\n`;
				},
			},
		]
	},




	/**************** PAGE *************/

	{
		groupName : 'Druck',
		icon      : 'fas fa-print',
		view      : 'style',
		snippets  : [
			{
				name : 'Toner-schonend',
				icon : 'fas fa-tint',
				gen  : dedent`
					/* Ink Friendly */
					*:is(.page,.monster,.note,.descriptive) {
						background : white !important;
						filter : drop-shadow(0px 0px 3px #888) !important;
					}

					.page img {
						visibility : hidden;
					}\n\n`
			},
		]
	}
];
