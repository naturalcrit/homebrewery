/* eslint-disable max-lines */

const MagicGen           = require('./snippets/magic.gen.js');
const ClassTableGen      = require('./snippets/classtable.gen.js');
const MonsterBlockGen    = require('./snippets/monsterblock.gen.js');
const scriptGen          = require('./snippets/script.gen.js');
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
			{
				name: 'Icons',
				icon: 'fas fa-icons',
				gen: function() {return "{{symbol}}";},
				subsnippets : [
					{
						name: "Königin",
						icon: 'fas fa-chess-queen',
						gen: function() {return "{{symbol,koenigin}}";}
					},
					{
						name: "Springer",
						icon: 'fas fa-chess-knight',
						gen: function() {return "{{symbol,springer}}";}
					},
					{
						name: "Bauer",
						icon: 'fas fa-chess-pawn',
						gen: function() {return "{{symbol,bauer}}";}
					},
					{
						name: "Feder",
						icon: 'fas fa-feather',
						gen: function() {return "{{symbol,feder}}";}
					},
					{
						name: "Medalie",
						icon: 'fas fa-medal',
						gen: function() {return "{{symbol,medalie}}";}
					},
					{
						name: "Helm",
						icon: 'fas fa-hard-hat',
						gen: function() {return "{{symbol,helm}}";}
					},
					{
						name: "Schubkarre",
						icon: 'fas fa-shopping-cart',
						gen: function() {return "{{symbol,schubkarre}}";}
					},
					{
						name: "Kompass",
						icon: 'far fa-compass',
						gen: function() {return "{{symbol,kompass}}";}
					},
					{
						name: "Turm",
						icon: 'fas fa-gopuram',
						gen: function() {return "{{symbol,turm}}";}
					},
					{
						name: "Schatz",
						icon: 'far fa-gem',
						gen: function() {return "{{symbol,schatz}}";}
					},
				]
			},
			{
				name: 'Logo',
				icon: 'fas fa-dice-d20',
				gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_rot.png)}}\n'; },
				subsnippets  : [
					{
						name : 'Würfel Rot',
						icon : 'fas fa-dice-d20',
						color: 'red',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_rot.png)}}\n'; }
					},
					{
						name : 'Würfel Braun',
						icon : 'fas fa-dice-d20',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_braun.png)}}\n'; }
					},
					{
						name : 'Würfel Orange',
						icon : 'fas fa-dice-d20',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_orange.png)}}\n'; }
					},
					{
						name : 'Würfel Gelb',
						icon : 'fas fa-dice-d20',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_gelb.png)}}\n'; }
					},
					{
						name : 'Würfel Hellgrün',
						icon : 'fas fa-dice-d20',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_hellgruen.png)}}\n'; }
					},
					{
						name : 'Würfel Grün',
						icon : 'fas fa-dice-d20',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_gruen.png)}}\n'; }
					},
					{
						name : 'Würfel Blau',
						icon : 'fas fa-dice-d20',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_blau.png)}}\n'; }
					},
					{
						name : 'Würfel Hellblau',
						icon : 'fas fa-dice-d20',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_hellblau.png)}}\n'; }
					},
					{
						name : 'Würfel Lila',
						icon : 'fas fa-dice-d20',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_lila.png)}}\n'; }
					},
					{
						name : 'Würfel Pink',
						icon : 'fas fa-dice-d20',
						gen  : function () { return '{{logo ![Ilaris Würfel-Logo](/assets/ilaris/icon_pink.png)}}\n'; }
					},
				]
			}
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
				icon : 'fas fa-archway',
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
				icon : 'fas fa-envelope',
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
				icon: 'far fa-copyright',
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
				name: "Dank und Copyright",
				icon: "fas fa-copyright",
				gen: dedent`
				#### Icons von [game-icons.net](https://game-icons.net/) unter [CC by 3.0](https://creativecommons.org/licenses/by/3.0/)
				Chess queen, Chess pawn, Chess knight, Open treasure chest von Skoll
				Feather, Compass, Medal skull, Locked fortress von Lorc
				Weight, Wheelbarrow von Delapouite
				Warlord helmet von Caro Asercion
				`
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
						{{kopfzeile Karten}}
						{{karten}}
			
						{{karte,schwarz
						#### Randfarben
						Gib eine Farbe für Rand und Überschrift an.
						Farbcodes für Manöverkarten:
						- \`schwarz\`: Proben & Profanes 
						- \`rot\`: Gesundheit 
						- \`braun\`: Kampf 
						- \`lila\`: Magie, Zauber
						- \`gold\`: Karma, Liturgie
						- \`pink\`: Pakt, Anrufung
						**Experte:** :: Eigene Farben können als Hex wie folgt angegeben werden: \`border-color:#7352A1\`
						}}
						
						{{karte,randlos
						##### Randlose Karte
						Setze \`randlos\` um den Rand der Karte wegzulassen. 
						
						**Experte:** :: Du kannst mit CSS auch eigene Randdicken wie zum Beispiel \`border:7mm;\` setzen.
						}}
						
						{{karte,
						#### Kartentitel
						##### Kartenuntertitel
						Kartentext oder Tabellen oder Bilder...
						Hier können auch andere Layoutelemente innerhalb einer Karte genutzt werden.
						###### Fußzeile
						}}
						
						{{karte,border-color:#984806
						#### Kartentitel
						Text...
						###### Fußzeile
						}}
						
						{{karte,
						#### Kartentitel
						##### Kartenuntertitel
						Kartentext oder Tabellen oder Bilder...
						###### Fußzeile
						}}
						
						{{karte,
						#### Kartentitel
						Mit Bild...
						
						![Kraeuterkopf](/assets/ilaris/Kraeuterkopf.png) {position:absolute,left:0.7cm,bottom:1cm,width:80%,mix-blend-mode:multiply}
						
						
						###### Fußzeile
						}}
						
						{{karte,border-color:#5F4778
						#### Kartentitel
						Text...
						###### Fußzeile
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
						
						###### Fußzeile
						}}
							
						
						{{karte,kleinertitel,kleinertext
						#### Sehr kleiner Kartentitel
						##### Mini-Untertitel
						Und äußerst kleiner Text...
						:
						In den weiten und magischen Landen erhob sich eine düstere Bedrohung, die das Gleichgewicht der Welt zu zerstören drohte. Verzweifelt versammelten sich tapfere Helden aus allen Ecken des Landes, bereit, sich der Herausforderung entgegenzustellen. 
						
						Gemeinsam durchstreiften sie gefährliche Wälder, uralte Verliese und unbekannte Reiche, um die Rätsel vergessener Artefakte zu lösen. In epischen Schlachten trafen sie auf mächtige Kreaturen und dunkle Magier, während sie ihre Entschlossenheit und Tapferkeit unter Beweis stellten. Schließlich erreichten sie den finsteren Meister des Bösen, um sich ihm in einem alles entscheidenden Kampf zu stellen.
						
						Mit vereinten Kräften gelang es den Helden, die Welt vor ihrem sicheren Untergang zu bewahren.
						###### Fußzeile
						}}
						
						{{seitenzahl,auto}}
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
