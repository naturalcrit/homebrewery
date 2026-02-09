```css
.beta {
	color         : white;
	padding       : 4px 6px;
	line-height   : 1em;
	background    : grey;
	border-radius : 12px;
	font-family   : monospace;
	font-size     : 10px;
	font-weight   : 800;
	margin-top    : -5px;
	margin-bottom : -5px;
}

.fac {
	height: 1em;
	line-height: 2em;
	margin-bottom: -0.05cm
}

h5 {
	font-size: .35cm !important;
}

.page ul ul {
	margin-left: 0px;
}

.page .taskList {
	display:block;
	break-inside:auto;
}

.taskList li input {
	list-style-type : none;
	margin-left : -0.52cm;
	transform: translateY(.05cm);
	filter: brightness(1.1) drop-shadow(1px 2px 1px #222);
}

.taskList ul {
	margin-bottom: 0px;
	margin-top: 0px;
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

.page p + pre {
	margin-top : 0.1cm;
}

.page ul + h5 {
	margin-top: 0.25cm;
}

.page p + h5 {
	margin-top: 0.25cm;
}

.page .openSans {
	font-family: 'Open Sans';
	font-size: 0.9em;
}

.page {
	padding-bottom: 1.5cm;
}

.varSyntaxTable th:first-of-type {
	width:6cm;
}

.page .exampleTable td,th {
	border:1px dashed #00000030;
}

.page .df {
  font-size: 2em;
  vertical-align: middle;
}
```

## changelog
For a full record of development, visit our [Github Page](https://github.com/naturalcrit/homebrewery).

### Friday 1/11/2026 - v3.20.1

{{taskList
##### calculuschild
* [x] Add D100 "ball" dice icons `:d100:` :df_d100_05:

##### G-Ambatte
* [x] Fix transparent edge on back cover image

Fixes issue [#4551](https://github.com/naturalcrit/homebrewery/issues/4551)

* [x] Fix "Out of sync" error when document contains extended unicode characters

Fixes issue [#4583](https://github.com/naturalcrit/homebrewery/issues/4583)

##### 5e-Cleric
* [x] Fix page count error on Vault

* [x] Fix cover page footnote set to all-caps

Fixes issue [#4559](https://github.com/naturalcrit/homebrewery/issues/4559)
}}

### Friday 11/14/2025 - v3.20.0

{{taskList
##### calculuschild
* [x] Cleanup and removal of redundant code (home/new/edit pages)
* [x] Compress brew payloads and when saving to speed up saving and reduce bandwidth usage

##### Gazook89
* [x] Cleanup (reorganizing files and folders)

##### G-Ambatte
* [x] Fix default save location failing on new documents 

Fixes issue [#4437](https://github.com/naturalcrit/homebrewery/issues/3175)
* [x] Fix usernames with special symbols unable to open userpage

Fixes issue [#807](https://github.com/naturalcrit/homebrewery/issues/807)
* [x] Cleanup (tests, documentation, localstorage key names)

Fixes issues [#4119](https://github.com/naturalcrit/homebrewery/issues/4119), [#4443](https://github.com/naturalcrit/homebrewery/issues/4443), [#4454](https://github.com/naturalcrit/homebrewery/issues/4454)
* [x] Added indexes to Mongo schema for speed improvements on local installs

##### 5e-Cleric
* [x] Better handling for errors during brew deletion
* [x] Improve file import error messaging
* [x] Tweaked editor visuals (scrollbar, dev environment, cursor type)

Fixes issue [#2689](https://github.com/naturalcrit/homebrewery/issues/2689)
* [x] Add support for math symbols in curly blocks for CSS `calc()`

Fixes issue [#3175](https://github.com/naturalcrit/homebrewery/issues/3175)

##### abquintic
* [x] Added new {{openSans **:fas_copyright: LICENSE**}} snippets (DriveThruRPG, AELF, GNU, WotC, Mongoose, etc.) with logos
* [x] Added d100 dice icons via `:icon_name:` syntax
* [x] Fix Firefox crash from very long blockquotes

Fixes issue [#3426](https://github.com/naturalcrit/homebrewery/issues/3426)

* [x] Allow more symbol characters in CSS vars inside curly blocks 

Fixes issue [#4201](https://github.com/naturalcrit/homebrewery/issues/4201)

* [x] Remove duplicate columnbreak at end of page

Fixes issue [#4401](https://github.com/naturalcrit/homebrewery/issues/4401)

* [x] Fix editor losing scroll position after page resize

Fixes issue [#2963](https://github.com/naturalcrit/homebrewery/issues/2963)

##### Emmanuel Ferdman (first contribution!)
* [x] Fixed edge case crash on admin page
}}

\page

### Wednesday 7/09/2025 - v3.19.3

{{taskList
##### calculuschild
* [x] Restoring original saving behavior; will continue investigating why save was failing for some users in background
}}


### Wednesday 7/09/2025 - v3.19.2

{{taskList
##### calculuschild
* [x] Hotfix for saving issues - Please refresh your browser and report if problems continue
}}

### Wednesday 7/09/2025 - v3.19.1

{{taskList
##### calculuschild
* [x] Send diffs instead of full file on save - should help with timeout/disconnect errors
}}

\column

### Thursday 05/22/2025 - v3.19.0

{{taskList
##### abquintic
* [x] Fix crash due to colons after `\page`

Fixes issue [#4105](https://github.com/naturalcrit/homebrewery/issues/4105)

* [x] Fix images with spaces in alt text not rendering

Fixes issue [#3659](https://github.com/naturalcrit/homebrewery/issues/3659)

* [x] Custom snippets! Open the new {{openSans **:fas_table_list: SNIPPETS**}} tab (next to the {{openSans **:fas_paintbrush: STYLE**}} tab). Custom snippets will appear in a new snippet dropdown, and will be included when imported as a custom theme.

* [x] Move several generic styles/snippets from PHB to the Blank theme; generic snippets like image masks no longer require the PHB theme.

* [x] Extract several Markdown+ syntax extensions into their own NPM packages, for use by the wider community.

* [x] Allow `\pagebreak` and `\columnbreak` as alternatives to `\page` and `\column`

Partially fixes issue [#4035](https://github.com/naturalcrit/homebrewery/issues/4035)

* [x] Fix misbehaving column breaks on old Chrome

Fixes issue [#4192](https://github.com/naturalcrit/homebrewery/issues/4192)

* [x] Self-host font-awesome icons; fix missing icons on local installs

Fixes issue [#1965](https://github.com/naturalcrit/homebrewery/issues/1965)
Fixes issue [#1548](https://github.com/naturalcrit/homebrewery/issues/1548)

##### G-Ambatte
* [x] Fix CORS issue on local installs

* [x] Fix print size issues when using the Facing and Flow view options.

Fixes issue [#4146](https://github.com/naturalcrit/homebrewery/issues/4146)

* [x] New built-in `$[HB_pageNumber]` variable. Works with math operations or can be reassigned like any other variable for more customization over the old `{{pageNumber,auto}}` snippet.\
New snippet found at {{openSans **:fas_pencil: TEXT EDITOR :fas_arrow_right: :fas_bookmark: PAGE NUMBERING :fas_arrow_right: :fas_arrow_down_1_9: VARIABLE AUTO PAGE NUMBER**}}

##### 5e-Cleric
* [x] Fix search bar covering up snippet bar (3 times)

Fixes issue [#4098](https://github.com/naturalcrit/homebrewery/issues/4098)

* [x] Save view toolbar settings across sessions

Fixes issue [#3835](https://github.com/naturalcrit/homebrewery/issues/3835)

* [x] Fix styling issues on the view toolbar

* [x] Update the Darkbrewery editor theme

Fixes issue [#3312](https://github.com/naturalcrit/homebrewery/issues/3312)

}}

\page

### Monday 03/10/2025 - v3.18.0

{{taskList
##### abquintic
* [x] Add ability to paste in any Share ID/URL into a brew's {{openSans :fas_circle_info: **Properties** :fas_arrow_right: **THEMES**}} selection, as long as that brew has been tagged as `meta:theme`. You can now share your custom brew themes without needing to make a personal copy.
* [x] Begin migration of custom Markdown extensions into their own NPM packages, for easier adoption by other users or projects
* [x] Fix external HTML appearing in open codeblocks

Fixes issue [#3206](https://github.com/naturalcrit/homebrewery/issues/3206)

* [x] Fix tables not rendering when directly after text


##### G-Ambatte
* [x] Cleanup of "cover pages" in the {{openSans :fas_rectangle_list: **NAVIGATION**}} list
* [x] Fix autosave triggering when no changes are present

Fixes issue [#4051](https://github.com/naturalcrit/homebrewery/issues/4051)

* [x] Remove empty table rows resulting from rowspan

Fixes issue [#1729](https://github.com/naturalcrit/homebrewery/issues/1729)

##### 5e-Cleric
* [x] Style fixes for covers art and logos on A4 size pages
* [x] Fix crash when trying to open brews that don't exist
* [x] Tweaks and style update styling on {{openSans **VAULT** :fas_dungeon:}} page.

Fixes issue [#4079](https://github.com/naturalcrit/homebrewery/issues/4079)

##### Calculuschild
* [x] `꞉꞉꞉꞉` now produces `<br>` instead of a `<div>`
* [x] Fix typos in tables freezing the editor

Fixes issue [#4059](https://github.com/naturalcrit/homebrewery/issues/4059)


##### MollyMaclachlan (New Contributor!)
* [x] Fixed typos in the Monster Stat Block snippet

Fixes issue [#4073](https://github.com/naturalcrit/homebrewery/issues/4073)


##### All
* [x] Update dependencies and scripts
* [x] Refactor components and backend tools
}}

\column

### Thursday 01/30/2025 - v3.17.0

{{taskList
##### 5e-Cleric

* [x] Update FAQ

* [x] Fix styling for Vault buttons and checkboxes

* [x] Improve navigation bar styling

* [x] Add feature to change username at https://www.naturalcrit.com/account

* [x] Fix Reddit link crash when title has non-latin chars

##### abquintic

* [x] Fix page shadows toolbar option

Fixes issue [#3919](https://github.com/naturalcrit/homebrewery/issues/3919)

* [x] Add `:>>>` syntax for horizontal :>>>>> spaces

* [x] Update Docker install instructions

Fixes issue [#1930](https://github.com/naturalcrit/homebrewery/issues/1930)

* [x] Allow styling pages via `\page{myStyles}` (with calculuschild)

Fixes issue [#3901](https://github.com/naturalcrit/homebrewery/issues/3901) 

* [x] Update Ubuntu install instructions

Fixes issue [#1952](https://github.com/naturalcrit/homebrewery/issues/1952)

* [x] Add `:-:` `:-` `-:` syntax for paragraph alignment, similar to table column alignment; for example:

-: -: Right-aligned

:-: :-: Centered

* [x] Add `:-- 50% --:` syntax to allow setting table column widths by percentage; for example:
```
| Narrow  | Wide   |
|:- 10% -:|:-90%--:|
|  Cell   | Cell   |
```


| Narrow  | Wide   |
|:- 10% -:|:-90%--:|
|Cell     | Cell   |
{exampleTable}

##### G-Ambatte

* [x] Fix crash when opening brew Properties tab

Fixes issue [#3927](https://github.com/naturalcrit/homebrewery/issues/3927)

* [x] Update error pages with steps to refresh credentials 

Fixes issue [#3955](https://github.com/naturalcrit/homebrewery/issues/3955)

* [x] Add {{openSans :fas_rectangle_list: **NAVIGATION**}} menu to the viewer toolbar

##### calculuschild

* [x] Reduce display lag on large brews

##### Gazook89

* [x] Smarter detection of current page number

Fixes issue [#3824](https://github.com/naturalcrit/homebrewery/issues/3824)

##### All
* [x] Update dependencies and scripts
* [x] Refactor components and fix various errors
}}

\page

### Wednesday 11/27/2024 - v3.16.1

{{taskList
##### 5e-Cleric

* [x] Allow linking to specific HTML IDs via `#ID` at the end of the URL, e.g.: `homebrewery.naturalcrit.com/share/share/a6RCXwaDS58i#p4` to link to Page 4 directly

Fixes issues [#2820](https://github.com/naturalcrit/homebrewery/issues/2820), [#3505](https://github.com/naturalcrit/homebrewery/issues/3505)

* [x] Fix generation of link to certain Google Drive brews

Fixes issue [#3776](https://github.com/naturalcrit/homebrewery/issues/3776)

##### abquintic

* [x] Fix blank pages appearing when pasting text

Fixes issue [#3718](https://github.com/naturalcrit/homebrewery/issues/3718)

##### Gazook89

* [x] Add new brew viewing options to the view toolbar
- {{fac,single-spread}} {{openSans **SINGLE PAGE**}}
- {{fac,facing-spread}} {{openSans **TWO PAGE**}}
- {{fac,flow-spread}} {{openSans **GRID**}}

Fixes issue [#1379](https://github.com/naturalcrit/homebrewery/issues/1379)

* [x] Updates to tag input boxes

##### G-Ambatte

* [x] Admin tools to fix certain corrupted documents

Fixes issue [#3801](https://github.com/naturalcrit/homebrewery/issues/3801)

* [x] Fix print window being affected by document zoom

Fixes issue [#3744](https://github.com/naturalcrit/homebrewery/issues/3744)


##### calculuschild, 5e-Cleric, G-Ambatte, Gazook89, abquintic

* [x] Multiple code refactors, cleanups, and security fixes
}}

### Saturday 10/12/2024 - v3.16.0

{{taskList
##### 5e-Cleric

* [x] Added a new API endpoint `/metadata/:shareId` to fetch metadata about individual brews

Fixes issue [#2638](https://github.com/naturalcrit/homebrewery/issues/2638)

* [x] Added A3, A5, and Card page size snippets under {{openSans **:fas_paintbrush: STYLE TAB :fas_arrow_right: :fas_print: PRINT**}}

* [x] Adjust navbar styling for very long titles

Fixes issue [#2071](https://github.com/naturalcrit/homebrewery/issues/2071)

* [x] Added some sorting options to the {{openSans **VAULT** {{fas,fa-dungeon}}}} page

* [x] Fix `language` property not working in share page

Fixes issue [#3776](https://github.com/naturalcrit/homebrewery/issues/3776)

##### abquintic

* [x] New {{openSans **:fas_pencil: TEXT EDITOR :fas_arrow_right: :fas_bookmark: PAGE NUMBER :fas_arrow_right:**}}
{{openSans **:fas_xmark: SKIP PAGE NUMBER**}} and {{openSans **:fas_arrow_rotate_left: RESTART PAGE NUMBER**}} snippets for more control over automatic page numbering.

Fixes issue [#513](https://github.com/naturalcrit/homebrewery/issues/513)

* [x] New Table of Contents control options via {{openSans **:fas_pencil: TEXT EDITOR :fas_arrow_right: :fas_book: TABLE OF CONTENTS**}} submenus. By default, H1-H3 is included in the ToC generation, but the new options allow marking `{{blocks}}` to include or exclude specific or ranges of contained headers. Also, a global option to increase the default range of H1-H3 to H1-H4/5/6. After applying these markers, you must regenerate the Table of Contents to see the changes.

* [x] Added a ":fas_lock: SYNC VIEWS" button onto the divider bar. When locked, scrolling on either panel will sync the other panel to the same page.

Fixes issue [#241](https://github.com/naturalcrit/homebrewery/issues/241)

##### Gazook89

* [x] Added a :fas_glasses: HIDE button to the page navigation bar

##### G-Ambatte

* [x] Automatic local backups of your files, in case of accidental data loss. Stores up to 5 snapshots of each brew edited in your browser, incrementing from a few minutes old to a maximum of several days. Restore a backup by clicking an entry in the new {{openSans **:fas_clock_rotate_left: HISTORY**}} button in the snippet bar.

Fixes issue [#3070](https://github.com/naturalcrit/homebrewery/issues/3070)

* [x] Fix issue with legacy brews breaking on Share page

Fixes issue [#3764](https://github.com/naturalcrit/homebrewery/issues/3764)

* [x] Fix print size when printing a zoomed document

Fixes issue [#3744](https://github.com/naturalcrit/homebrewery/issues/3744)

##### All

* [x] Background code cleanup, security fixes, dev tool improvements, dependency updates, prep for upcoming features, etc.
}}

### Wednesday 9/25/2024 - v3.15.1

{{taskList
##### calculuschild

* [x] Background fixes to handle Google Drive issues

* [x] Remove duplicate error logging

##### calculuschild, 5e-Cleric

* [x] Fix links in {{openSans **RECENT BREWS :fas_clock_rotate_left:**}} and user {{openSans **BREWS :fas_beer_mug_empty:**}} pointing to trashed Google Drive files after transferring from Google to Homebrewery storage

Fixes issue [#3776](https://github.com/naturalcrit/homebrewery/issues/3776)
}}

\page

### Wednesday 9/04/2024 - v3.15.0

{{taskList
##### 5e-Cleric, abquintic, calculuschild, Gazook89, G-Ambatte, Ericsheid, Kaiburr

* [x] New {{openSans **VAULT** {{fas,fa-dungeon}}}} page 🎉🎉🎉
:
All **PUBLISHED** brews ({{openSans :fas_circle_info: **Properties**}} menu) will be searchable, by title or author, and filtered by renderer. More features and adjustments will be coming.
:
Note: If any of your own brews are not showing up in search (particularly if stored on Google Drive), please edit and re-save to ensure our database has the data needed from document to be searchable. 

Fixes issue [#697](https://github.com/naturalcrit/homebrewery/issues/697)

##### Gazook89

* [x] Auto-focus on text editor when switching editor tabs
}}

### Wednesday 8/28/2024 - v3.14.3

{{taskList
##### calculuschild, G-Ambatte

* [x] New {{openSans **IMAGES → {{fac,image-wrap-left}} IMAGE WRAP LEFT/RIGHT**}} snippets

Fixes issue [#380](https://github.com/naturalcrit/homebrewery/issues/380)

* [x] Fix v3.14.2 bug with `꞉꞉꞉꞉` failing after tables

##### 5e-Cleric

* [x] Fix Account page crash when not logged in

Fixes issue [#3605](https://github.com/naturalcrit/homebrewery/issues/3605)

##### abquintic

* [x] Fix jump hotkeys conflicting with `CTRL + SHIFT`. Preview and Source movement shortcuts now use `CTRL + SHIFT + META + LEFT\RIGHTARROW`

##### G-Ambatte

* [x] Fix display issue with image wrap icons
}}


### Tuesday 8/27/2024 - v3.14.2

{{taskList
##### calculuschild

* [x] Reroute invalid urls to homepage

Fixes issues [#3269](https://github.com/naturalcrit/homebrewery/issues/3629)

* [x] Background dependency updates

##### G-Ambatte

* [x] Add route to get brew styling via `/css/shareId`

Fixes issues [#1097](https://github.com/naturalcrit/homebrewery/issues/1097)

* [x] Fix `:emojis:` preventing code folding

Fixes issues [#3604](https://github.com/naturalcrit/homebrewery/issues/3604)

* [x] Fix mask image warping when rotated and stretched

Fixes issues [#3636](https://github.com/naturalcrit/homebrewery/issues/3636)

* [x] Fix Table of Contents uppercasing

Fixes issues [#3572](https://github.com/naturalcrit/homebrewery/issues/3572)

##### abquintic

* [x] Create globally unique Header IDs across pages

Fixes issues [#1430](https://github.com/naturalcrit/homebrewery/issues/1430)

* [x] Fix colon `꞉꞉꞉꞉` being parsed in codeblocks

* [x] Prevent crashes when loading undefined renderer or theme bundle

* [x] Add Jump-To hotkeys

  * Use `CTRL/META + SHIFT + LEFTARROW` to brewJump
  * Use `CTRL/META + SHIFT + RIGHTARROW` to sourceJump

* [x] Prevent reload from clobbering modified fresh clones

##### 5e-Cleric, Gazook89

* [x] Viewer tools for zoom/page navigation
}}

### Tuesday 8/13/2024 - v3.14.1

{{taskList
##### abquintic

* [x] Allow Table of Contents to flow across columns

Fixes issues [#2563](https://github.com/naturalcrit/homebrewery/issues/2563)

* [x] Fix unusual margin spacing for adjacent `.descriptive` and `.wide` blocks

Fixes issues [#2688](https://github.com/naturalcrit/homebrewery/issues/2688)

* [x] Add code folding to :fas_paintbrush: {{openSans **STYLE**}} tab

##### G-Ambatte

* [x] Fix edge case where Table of Contents generator changed capitalization of headings

Fixes issues [#3572](https://github.com/naturalcrit/homebrewery/issues/3572)

* [x] Fix **Ink Friendly** snippet causing unselectable PDF text

Fixes issues [#3563](https://github.com/naturalcrit/homebrewery/issues/3563)

* [x] Prevent brews selecting themselves as a theme

Fixes issues [#3614](https://github.com/naturalcrit/homebrewery/issues/3614)

* [x] Fix info pages (`/faq`, `/migrate`, etc.) showing blank authorship info

Fixes issues [#3568](https://github.com/naturalcrit/homebrewery/issues/3568)

* [x] Add `abs()`, `sign()` and `signed()` functions to variable syntax math handler

Fixes issues [#3537](https://github.com/naturalcrit/homebrewery/issues/3537)

* [x] Fix variable math handler not processing commas (i.e., in `$[max(varA,varB)]`

Fixes issues [#3613](https://github.com/naturalcrit/homebrewery/issues/3613)

* [x] Fix variable math handler scrambling variables with names that are subsets of other variables 

Fixes issues [#3622](https://github.com/naturalcrit/homebrewery/issues/3622)

##### calculuschild

* [x] Fix `/migrate` page using an editor context instead of share context

##### 5e-Cleric

* [x] Fix Monster Stat Blocks losing color in Safari
}}

\page

### Monday 7/29/2024 - v3.14.0
{{taskList

##### abquintic, calculuschild

* [x] Alternative Brew Themes, including importing other brews as a base theme.

- In the :fas_circle_info: **Properties** menu, find the new {{openSans **THEME**}} dropdown. It lists Brew Themes, including a new **Blank** theme as a simpler basis for custom styling.
- Brews tagged with `meta:theme` will appear in the Brew Themes list. Selecting one loads its :fas_paintbrush: **Style** tab contents as the CSS basis for the current brew, allowing one brew to style multiple documents.
- Brews with `meta:theme` can also select their own Theme, i.e. layering Themes on top of each other.
- The next goal is to make **Published** Themes shareable between users.


Fixes issues [#1899](https://github.com/naturalcrit/homebrewery/issues/1899), [#3085](https://github.com/naturalcrit/homebrewery/issues/3085)

##### G-Ambatte

* [x] Fix Drop-cap font becoming corrupted when Bold

Fixes issues [#3551](https://github.com/naturalcrit/homebrewery/issues/3551)

* [x] Fixes to UI styling

Fixes issues [#3568](https://github.com/naturalcrit/homebrewery/issues/3568)

}}


### Saturday 6/7/2024 - v3.13.1
{{taskList

##### calculuschild, G-Ambatte

* [x] Hotfixes for issues with v3.13.0

Fixes issues [#3559](https://github.com/naturalcrit/homebrewery/issues/3559), [#3552](https://github.com/naturalcrit/homebrewery/issues/3552), [#3554](https://github.com/naturalcrit/homebrewery/issues/3554)
}}

### Friday 28/6/2024 - v3.13.0
{{taskList

##### calculuschild

* [x] Add `:emoji:` Markdown syntax, with autosuggest; start typing after the first `:` for matching emojis from 
:fab_font_awesome: FontAwesome, :df_d20: DiceFont, :ei_action: ElderberryInn, and a subset of :gi_broadsword: GameIcons

* [x] Fix `{curly injection}` to append to, rather than erase and replace target CSS
* [x] {{openSans **GET PDF**}} {{fa,fa-file-pdf}} now opens the print dialog directly, rather than redirecting to a separate page

##### Gazook

* [x] Several small style tweaks to the UI
* [x] Cleaning and refactoring several large pieces of code

##### 5e-Cleric

* [x] For error pages, add links to user account and `/share` page if available

Fixes issue [#3298](https://github.com/naturalcrit/homebrewery/issues/3298)

* [x] Change FrontCover title to use stroke outline instead of faking it with dozens of shadows
* [x] Cleaning and refactoring several large pieces of CSS

##### abquintic

* [x] Added additional {{openSans **TABLE OF CONTENTS**}} snippet options. Explicitly include or exclude items from the ToC generation via CSS properties  
`--TOC:exclude` or `--TOC:include`, or change the included header depth from 3 to 6 (default 3) with `tocDepthH6`

##### MurdoMaclachlan *(new contributor!)*

* [x] Added "proficiency bonus" to Monster Stat Block snippet. 

Fixes issue [#3397](https://github.com/naturalcrit/homebrewery/issues/3397)
}}

### Monday 18/3/2024 - v3.12.0
{{taskList

##### 5e-Cleric

* [x] Fix language-specific hyphenation on print page

Fixes issue [#3294](https://github.com/naturalcrit/homebrewery/issues/3294)

* [x] Upgrade Font-Awesome to v6.51

* [x] Allow downloaded files to be uploaded via {{openSans **NEW {{fa,fa-plus-square}} → FROM UPLOAD {{fa,fa-upload}}**}}

##### G-Ambatte

* [x] Fix an edge case crash with empty documents

Fixes issue [#3315](https://github.com/naturalcrit/homebrewery/issues/3315)

* [x] Brews on the user page can be searched by tag; clicking a tag adds it to the filter

Fixes issue [#3164](https://github.com/naturalcrit/homebrewery/issues/3164)

* [x] Add *DiceFont* icons {{df,d20-20}} `{{df,icon-name}}`

##### abquintic

* [x] Fix ^super^ and ^^sub^^ highlighting in the text editor

* [x] Add new syntax for multiline Definition Lists:


```
Term
::Definition 1
::Definition 2
with more text
```

produces:

Term
::Definition 1
::Definition 2
with more text

Fixes issue [#2340](https://github.com/naturalcrit/homebrewery/issues/2340)

##### RKuerten :
* [x] Fix monster stat block backgrounds on print page

Fixes issue [#3275](https://github.com/naturalcrit/homebrewery/issues/3275)

* [x] Added new text editor theme: "Darkvision".

##### calculuschild, G-Ambatte, 5e-Cleric

* [x] Codebase and UI cleanup
}}

\page


### Friday 21/2/2024 - v3.11.0
{{taskList

##### Gazook89

* [x] Brew view count no longer increases when viewed by owner

Fixes issue [#3037](https://github.com/naturalcrit/homebrewery/issues/3037)

* [x] Small tweak to PHB H3 sizing

Fixes issue [#2989](https://github.com/naturalcrit/homebrewery/issues/2989)

* [x] Add **Fold/Unfold All** {{fas,fa-compress-alt}} / {{fas,fa-expand-alt}} buttons to editor bar 

Fixes issue [#2965](https://github.com/naturalcrit/homebrewery/issues/2965)


##### G-Ambatte

* [x] Share link added to Editor Access error page

Fixes issue [#3086](https://github.com/naturalcrit/homebrewery/issues/3086)

* [x] Add Darkbrewery theme to Editor theme selector {{fas,fa-palette}}

Fixes issue [#3034](https://github.com/naturalcrit/homebrewery/issues/3034)

* [x] Fix Firefox prints with alternating blank pages

Fixes issue [#3115](https://github.com/naturalcrit/homebrewery/issues/3115)

* [x] Admin page working again

Fixes issue [#2657](https://github.com/naturalcrit/homebrewery/issues/2657)


##### 5e-Cleric

* [x] Fix indenting issue with Monster Blocks and italics in Class Feature

Fixes issues [#527](https://github.com/naturalcrit/homebrewery/issues/527),
[#3247](https://github.com/naturalcrit/homebrewery/issues/3247)

* [x] Allow CSS vars in curly syntax to be formatted as strings using single quotes

`{{--customVar:"'a string'"}}`

Fixes issue [#3066](https://github.com/naturalcrit/homebrewery/issues/3066)

* [x] Add *Elderberry Inn* icons {{ei,action}} `{{ei,icon-name}}`

Fixes issue [#3171](https://github.com/naturalcrit/homebrewery/issues/3171)

* [x] New {{openSans **{{fas,fa-keyboard}} FONTS**  }} snippets!

Fixes issue [#3171](https://github.com/naturalcrit/homebrewery/issues/3171)

* [x] New page now opens in a new tab


##### abquintic (new contributor!)

* [x] Add ^super^ `^abc^` and ^^sub^^ `^^abc^^` syntax.
 
Fixes issue [#2171](https://github.com/naturalcrit/homebrewery/issues/2171)

* [x] Add HTML tag assignment to curly syntax `{{tag=value}}`
 
Fixes issue [1488](https://github.com/naturalcrit/homebrewery/issues/1488)

* [x] {{openSans **Brew → Clone to New**}} now clones tags
 
Fixes issue [1488](https://github.com/naturalcrit/homebrewery/issues/1488)

##### calculuschild

* [x] Better error messages for "Out of Google Drive Storage" and "Not logged in to edit"

Fixes issues [2510](https://github.com/naturalcrit/homebrewery/issues/2510),
[2975](https://github.com/naturalcrit/homebrewery/issues/2975)

* [x] Brew Variables
}}

\

{{wide

### Brew Variable Syntax

You may already be familiar with `[link](url)` and `![image](url)` synax. We have expanded this to include a third `$[variable](text)` syntax. All three of these syntaxes now share a common set of features:

{{varSyntaxTable
| syntax | description |
|:-------|-------------|
| `[var]:content`  | Assigns a variable (must start on a line by itself, and ends at the next blank line) |
| `[var](content)` | Assigns a variable and outputs it (can be inline) |
| `[var]`  | Outputs the variable contents as a link, if formatted as a valid link |
| `![var]` | Outputs as an image, if formatted as a valid image                    |
| `$[var]` | Outputs as Markdown                                          |
| `$[var1 + var2 - 2 * var3]` | Performs math operations and outputs result if all variables are valid numbers                                     |
}}

}}

{{wide,margin-top:0,margin-bottom:0
### Examples
}}

{{wide,columns:2,margin-top:0,margin-bottom:0

```
[first]: Bob

[last]: Jones

My name is $[first] $[last].
```

\column

[first]: Bob

[last]: Jones

My name is $[first] $[last].

}}

{{wide,columns:2,margin-top:0,margin-bottom:0

```
[myTable]:
| h1 | h2 |
|----|----|
| c1 | c2 |

Here is my table:
$[myTable]
```

\column

[myTable]:
| h1 | h2 |
|----|----|
| c1 | c2 |

Here is my table:
$[myTable]
}}

{{wide,columns:2,margin-top:0,margin-bottom:0

```
There are $[TableNum] tables total.

#### Table $[TableNum](1): Horses

#### Table $[TableNum]($[TableNum + 1]): Cows
```

\column

There are $[TableNum] tables in this document. *(note: final value of `$[TableNum]` gets hoisted up if available)*


#### Table $[TableNum](1): Horses

#### Table $[TableNum]($[TableNum + 1]): Cows
}}

\page

### Friday 13/10/2023 - v3.10.0
{{taskList

##### G-Ambatte

* [x] Fix user preferred save location being ignored

Fixes issue [#2993](https://github.com/naturalcrit/homebrewery/issues/2993)

* [x] Fix crash to white screen when starting new brews while not signed in

Fixes issue [#2999](https://github.com/naturalcrit/homebrewery/issues/2999)

* [x] Fix FreeBSD install script 

Fixes issue [#3005](https://github.com/naturalcrit/homebrewery/issues/3005)

* [x] Fix *"This brew has been changed on another device"* triggering when manually saving during auto-save

Fixes issue [#2641](https://github.com/naturalcrit/homebrewery/issues/2641)

* [x] Fix Firefox different column-flow behavior

Fixes issue [#2982](https://github.com/naturalcrit/homebrewery/issues/2982)

* [x] Fix brew titles being mis-sorted on user page

Fixes issue [#2775](https://github.com/naturalcrit/homebrewery/issues/2775)

* [x] Text Editor themes now available via new drop-down

Fixes issue [#362](https://github.com/naturalcrit/homebrewery/issues/362)

##### 5e-Cleric

* [x] New {{openSans **PHB → {{fas,fa-quote-right}} QUOTE**  }} snippet for V3!

Fixes issue [#2920](https://github.com/naturalcrit/homebrewery/issues/2920)

* [x] Several updates and fixes to FAQ and Welcome page

Fixes issue [#2729](https://github.com/naturalcrit/homebrewery/issues/2729),
[#2787](https://github.com/naturalcrit/homebrewery/issues/2787)

##### Gazook89

* [x] Add syntax highlighting for Definition Lists <code>:\:</code>
}}


### Thursday 17/08/2023 - v3.9.2
{{taskList

##### calculuschild

* [x] Fix links to certain old Google Drive files

Fixes issue [#2917](https://github.com/naturalcrit/homebrewery/issues/2917)

##### G-Ambatte

* [x] Menus now open on click, and internally consistent

Fixes issue [#2702](https://github.com/naturalcrit/homebrewery/issues/2702), [#2782](https://github.com/naturalcrit/homebrewery/issues/2782) 

* [x] Add smarter footer snippet

Fixes issue [#2289](https://github.com/naturalcrit/homebrewery/issues/2289) 

* [x] Add sanitization in Style editor

Fixes issue [#1437](https://github.com/naturalcrit/homebrewery/issues/1437) 

* [x] Rework class table snippets to remove unnecessary randomness

Fixes issue [#2964](https://github.com/naturalcrit/homebrewery/issues/2964) 

* [x] Add User Page link to Google Drive file for file owners, add icons for additional storage locations

Fixes issue [#2954](https://github.com/naturalcrit/homebrewery/issues/2954) 

* [x] Add default save location selection to Account Page

Fixes issue [#2943](https://github.com/naturalcrit/homebrewery/issues/2943) 

##### 5e-Cleric

* [x] Exclude cover pages from Table of Content generation (editing on mobile is still not recommended)

Fixes issue [#2920](https://github.com/naturalcrit/homebrewery/issues/2920)

##### Gazook89

* [x] Adjustments to improve mobile viewing
}}



### Wednesday 28/06/2023 - v3.9.1
{{taskList

##### G-Ambatte

* [x] Better error pages with more useful information

Fixes issue [#1924](https://github.com/naturalcrit/homebrewery/issues/1924) 
}}

### Friday 02/06/2023 - v3.9.0
{{taskList

##### calculuschild

* [x] Fix some files not showing up on userpage when user has a large number of brews in Google Drive

Fixes issue [#2408](https://github.com/naturalcrit/homebrewery/issues/2408) 

* [x] Pressing tab now indents with spaces instead of tab character; fixes several issues with Markdown lists

Fixes issues [#2092](https://github.com/naturalcrit/homebrewery/issues/2092), [#1556](https://github.com/naturalcrit/homebrewery/issues/1556)

* [x] Rename `naturalCritLogo.svg` to `naturalCritLogoRed.svg`. Those using the {{beta BETA}} coverPage snippet may need to update that text to make the NaturalCrit logo appear again.

##### G-Ambatte

* [x] Fix strange animation of image masks

Fixes issue [#2790](https://github.com/naturalcrit/homebrewery/issues/2790) 

##### 5e-Cleric

* [x] New {{openSans **PHB → {{fac,book-part-cover}} PART COVER PAGE**  }} snippet for V3!

* [x] New {{openSans **PHB → {{fac,book-back-cover}} BACK COVER PAGE**  }} snippet for V3! (Thanks to /u/Kaiburr_Kath-Hound on Reddit for providing some of these resources!)

* [x] New {{openSans **TEXT EDITOR → {{fas,fa-bars}} INDEX**  }} snippet for V3!

* [x] Fix highlighting of curly braces inside comments

Fixes issue [#2784](https://github.com/naturalcrit/homebrewery/issues/2784) 
}}

\page

### Wednesday 12/04/2023 - v3.8.0
{{taskList

##### calculuschild

* [x] Rename `{{coverPage}}` to `{{frontCover}}`. Those using this {{beta BETA}} feature will need to update that text to make the cover page appear again.

* [x] Several background fixes to test scripts

##### Jeddai

* [X] Add content negotiation to exclude image requests from our API calls

Fixes issue [#2595](https://github.com/naturalcrit/homebrewery/issues/2595)

##### G-Ambatte

* [x] Update server build scripts to fix Admin page

Fixes issues [#2657](https://github.com/naturalcrit/homebrewery/issues/2657)

* [x] Fix internal links inside `<\div>` blocks not receiving the `target=_self` attribute

Fixes issues [#2680](https://github.com/naturalcrit/homebrewery/issues/2680)

* [x] See brew details on `/share` pages by clicking the brew title (author, last update, tags, etc.)

Fixes issues [#1679](https://github.com/naturalcrit/homebrewery/issues/1679)

* [x] Add local Windows install script via Chocolatey

##### 5e-Cleric

* [x] New {{openSans **TABLES → {{fas,fa-language}} RUNE TABLE**}} snippets for V3. Adds an alphabetic script translation table.

* [x] New {{openSans **IMAGES → {{fac,mask-center}} WATERCOLOR CENTER**  }} snippets for V3, which adds a stylish watercolor texture to the center of your images!

* [x] New {{openSans **PHB → {{fac,book-inside-cover}} INSIDE COVER PAGE**  }} snippet for V3! (Thanks to /u/Kaiburr_Kath-Hound on Reddit for providing some of these resources!)

* [x] Add some missing characters {{font-family:scalySansRemake Ñ ñ ç Ç Ý ý # ^ ¿ ' " ¡ ·}} to the "scalySansRemake" font in V3.

Fixes issues [#2280](https://github.com/naturalcrit/homebrewery/issues/2280)

##### Gazook89

* [x] Add "Language" selector in {{fa,fa-info-circle}} **Properties** menu. Sets the HTML Lang attribute for your brew to better handle hyphenation or spellcheck.

Fixes issues [#1343](https://github.com/naturalcrit/homebrewery/issues/1343)

* [x] Fix a crash when multiple `{injection}` tags appear in sequence

Fixes issues [#2712](https://github.com/naturalcrit/homebrewery/issues/2712)

##### MichielDeMey

* [x] Remove all-caps display on Account button since usernames are case-sensitive.

Fixes issues [#2731](https://github.com/naturalcrit/homebrewery/issues/2731)

}}

### Monday 13/03/2023 - v3.7.2
{{taskList

##### calculuschild

* [x] Fix wide Monster Stat Blocks not spanning columns on Legacy
}}

### Thursday 09/03/2023 - v3.7.1
{{taskList

##### Lucastucious (new contributor!)

* [x] Changed `filter: drop-shadow` to `box-shadow` on text boxes, making PDF text selectable

Fixes issues [#1569](https://github.com/naturalcrit/homebrewery/issues/1569)

{{note
**NOTE:** If you create your PDF on a computer with an old version of Mac Preview (v10 or older) you may see shadows appear as solid gray.
}}

##### MichielDeMey

* [x] Updated the Google Drive icon
* [x] Backend fix to unit tests failing intermittently

##### calculuschild

* [x] Fix PDF pixelation on CoverPage text outlines
}}

### Tuesday 28/02/2023 - v3.7.0
{{taskList

{{note
**NOTE:** Some new snippets will now show a {{beta BETA}} tag. Feel free to use them, but be aware we may change how they work depending on your feedback.
}}

##### calculuschild

* [x] New {{openSans **IMAGES → WATERCOLOR EDGE** {{fac,mask-edge}} }} and {{openSans **WATERCOLOR CORNER** {{fac,mask-corner}} }} snippets for V3, which adds a stylish watercolor texture to the edge of your images! (Thanks to /u/flamableconcrete on Reddit for providing these image masks!)

* [x] Fix site not displaying on iOS devices

##### 5e-Cleric

* [x] New {{openSans **PHB → COVER PAGE** {{fac,book-front-cover}} }} snippet for V3, which adds a stylish coverpage to your brew! (Thanks to /u/Kaiburr_Kath-Hound on Reddit for providing some of these resources!)

##### MichielDeMey (new contribuor!)

* [x] Fix typo in testing scripts
* [x] Fix "mug" image not using HTTPS

Fixes issues [#2687](https://github.com/naturalcrit/homebrewery/issues/2687)
}}

### Saturday 18/02/2023 - v3.6.1
{{taskList
##### G-Ambatte

* [x] Fix users not being removed from Authors list

Fixes issues [#2674](https://github.com/naturalcrit/homebrewery/issues/2674)
}}

### Monday 23/01/2023 - v3.6.0
{{taskList
##### calculuschild

* [x] Fix Google Drive brews sometimes duplicating

Fixes issues [#2603](https://github.com/naturalcrit/homebrewery/issues/2603)

##### Jeddai

* [x] Add unit tests with full coverage for the Homebrewery API

* [x] Add message to refresh the browser if the user is missing an update to the Homebrewery

Fixes issues [#2583](https://github.com/naturalcrit/homebrewery/issues/2583)
}}

\page

{{taskList
##### G-Ambatte

* [x] Auto-compile Themes CSS on development server

##### 5e-Cleric

* [x] Fix cloned brews inheriting the parent view count
}}


### Friday 23/12/2022 - v3.5.0
{{taskList

##### Jeddai

* [x] Only brew owners or invited authors can edit a brew

  - Visiting an `/edit` page of a brew that does not list you as an author will result in an error page. Authors can be added to any brew by opening its {{fa,fa-info-circle}} **Properties** menu and typing the author's username (case-sensitive) into the **Invited Authors** bubble.
  - Warn user if a newer brew version has been saved on another device

Fixes issues [#1987](https://github.com/naturalcrit/homebrewery/issues/1987)
}}

### Saturday 10/12/2022 - v3.4.2
{{taskList

##### Jeddai

* [x] Fix broken tags editor

* [x] Reduce server load to fix some saving issues

Fixes issues [#2322](https://github.com/naturalcrit/homebrewery/issues/2322)

##### G-Ambatte

* [x] Account page help link for Google Drive errors

Fixes issues [#2520](https://github.com/naturalcrit/homebrewery/issues/2520)
}}

### Monday 05/12/2022 - v3.4.1
{{taskList

##### G-Ambatte

* [x] Fix Account page incorrect last login time

Fixes issues [#2521](https://github.com/naturalcrit/homebrewery/issues/2521)

##### Gazook

* [x] Fix crashing on iOS and Safari browsers

Fixes issues [#2531](https://github.com/naturalcrit/homebrewery/issues/2531)
}}

### Monday 28/11/2022 - v3.4.0
{{taskList

##### G-Ambatte

* [x] Fix for Chrome v108 handling of page size

Fixes issues [#2445](https://github.com/naturalcrit/homebrewery/issues/2445), [#2516](https://github.com/naturalcrit/homebrewery/issues/2516)

* [x] New account page with some user info, at {{openSans **USERNAME {{fa,fa-user}} → ACCOUNT {{fa,fa-user}}**}}

Fixes issues [#2049](https://github.com/naturalcrit/homebrewery/issues/2049), [#2043](https://github.com/naturalcrit/homebrewery/issues/2043)

* [x] Fix "Published/Private Brews" buttons on userpage

Fixes issues [#2449](https://github.com/naturalcrit/homebrewery/issues/2449)

##### Gazook

* [x] Make autosave default on for new users

* [x] Added link to our FAQ at {{openSans **NEED HELP? {{fa,fa-question-circle}} → FAQ {{fa,fa-question-circle}}**}}

* [x] Fix curly blocks freezing with long property lists

Fixes issues [#2393](https://github.com/naturalcrit/homebrewery/issues/2393)

* [x] Items can now be removed from {{openSans **RECENT BREWS** {{fas,fa-history}} }}

Fixes issues [#1918](https://github.com/naturalcrit/homebrewery/issues/1918)

* [x] Curly injector syntax `{blue}` highlighting in editor

Fixes issues [#1670](https://github.com/naturalcrit/homebrewery/issues/1670)

}}

### Thursday 28/10/2022 - v3.3.1
{{taskList

##### calculuschild

* [x] Fixes to several broken CSS styles from v3.3.0

Fixes issues  [#2468](https://github.com/naturalcrit/homebrewery/issues/2468)

##### Jeddai

* [x] Reduce size of thumbnails on social media links

}}

### Friday 19/10/2022 - v3.3.0
{{taskList

##### calculuschild

* [x] Fix for tables broken by Chrome v106


##### G-Ambatte:

* [x] Fix Table of Contents broken by Chrome v106

Fixes issues  [#2437](https://github.com/naturalcrit/homebrewery/issues/2437)

* [x] Show brew thumbnails on user page

Fixes issues  [#2331](https://github.com/naturalcrit/homebrewery/issues/2331)

* [x] Allow longer URLs for brew thumbnails

Fixes issues  [#2351](https://github.com/naturalcrit/homebrewery/issues/2351)

* [x] Code no longer unfolds when inserting a snippet

Fixes issues  [#2135](https://github.com/naturalcrit/homebrewery/issues/2135)

* [x] Fix brew settings being lost on first save

Fixes issues  [#2427](https://github.com/naturalcrit/homebrewery/issues/2427)

##### Gazook:

* [x] Several updates to bug reporting and error popups

Fixes issues  [#2376](https://github.com/naturalcrit/homebrewery/issues/2376)

* [x] Fixes to userpage search bar

Fixes issues  [#1675](https://github.com/naturalcrit/homebrewery/issues/1675), [#2353](https://github.com/naturalcrit/homebrewery/issues/2353)

* [x] Renderer *(legacy / V3)* now shown next to page #

Fixes issues  [#1928](https://github.com/naturalcrit/homebrewery/issues/1928)

* [x] Prevent text selection when moving divider bar

Fixes issues  [#1632](https://github.com/naturalcrit/homebrewery/issues/1632)

* [x] Tweak Monster Stat Block coloring

Fixes issues  [#2123](https://github.com/naturalcrit/homebrewery/issues/2123)

* [x] Added dropdown button to toggle autosave

Fixes issues  [#1546](https://github.com/naturalcrit/homebrewery/issues/1546)

}}


### Friday 08/09/2022 - v3.2.2
{{taskList

##### Jeddai:

* [x] Fix brews not deleting from User page when removed from Google Drive externally.

  Fixes issues: [#2325](https://github.com/naturalcrit/homebrewery/issues/2325)

##### G-Ambatte:

* [x] Brew Tags are now searchable on the User page

Fixes issues  [#2317](https://github.com/naturalcrit/homebrewery/issues/2317), [#2319](https://github.com/naturalcrit/homebrewery/issues/2319), [#2334](https://github.com/naturalcrit/homebrewery/issues/2334)

* [x] Several tweaks to the User page

 Fixes issues:  [#1797](https://github.com/naturalcrit/homebrewery/issues/1797), [#2315](https://github.com/naturalcrit/homebrewery/issues/2315), [#2326](https://github.com/naturalcrit/homebrewery/issues/2326), [#2328](https://github.com/naturalcrit/homebrewery/issues/2328)
}}



\page

### Wednesday 31/08/2022 - v3.2.1
{{taskList

##### calculuschild

* [x] Reference Links should now work inside tables

	Fixes issues: [#2307](https://github.com/naturalcrit/homebrewery/issues/2307)

##### Jeddai:

* [x] Fix printing from `/new` not working

  Fixes issues: [#1789](https://github.com/naturalcrit/homebrewery/issues/1789), [#1806](https://github.com/naturalcrit/homebrewery/issues/1806)

* [x] Fix broken snippet buttons on `/new`

  Fixes issues: [#2311](https://github.com/naturalcrit/homebrewery/issues/2311)

##### G-Ambatte:

* [x] Several small tweaks to the User page

  Fixes issues: [#2301](https://github.com/naturalcrit/homebrewery/issues/2301), [#2303](https://github.com/naturalcrit/homebrewery/issues/2303), [#2121](https://github.com/naturalcrit/homebrewery/issues/2121)
}}

### Saturday 27/08/2022 - v3.2.0
{{taskList

##### calculuschild

* [x] The V3 renderer is now the default for new brews.

* [x] Small tweaks to the spacing around the `classTable` style

##### Jeddai:

* [x] Brew transfers between Homebrewery and Google Drive now keep the same share and edit links! Metadata is now also kept across transfers.

  Fixes issues: [#1838](https://github.com/naturalcrit/homebrewery/issues/1838)

* [x] Brews can now be labeled with tags; these will be searchable on the My Brews page in a future update.

  Fixes issues: [#758](https://github.com/naturalcrit/homebrewery/issues/758)

##### Jlgraves:

* [x] Small tweaks to the `ClassFeature` snippet

  Fixes issues: [#2215](https://github.com/naturalcrit/homebrewery/issues/2215)
}}


### Thursday 09/06/2022 - v3.1.1
{{taskList

##### calculuschild:

* [x] Fixed class table decorations appearing on top of the table in PDF output.

  Fixes issues: [#1784](https://github.com/naturalcrit/homebrewery/issues/1784)

* [x] Fix bottom decoration on half class tables disappearing when the table is too short.

  Fixes issues: [#2202](https://github.com/naturalcrit/homebrewery/issues/2202)
}}

### Monday 06/06/2022 - v3.1.0
{{taskList

##### G-Ambatte:

* [x] "Jump to Preview/Editor" buttons added to the divider bar. Easily sync between the editor and preview panels!

  Fixes issues: [#1756](https://github.com/naturalcrit/homebrewery/issues/1756)

* [x] Speedups to the user page for users with large and/or many brews.

  Fixes issues: [#2147](https://github.com/naturalcrit/homebrewery/issues/2147)

* [x] Search text on the user page is saved to the URL for easy bookmarking in your browser

  Fixes issues: [#1858](https://github.com/naturalcrit/homebrewery/issues/1858)

* [x] Added easy login system for offline installs.

  Fixes issues: [#269](https://github.com/naturalcrit/homebrewery/issues/269)

* [x] New **THUMBNAIL** option in the {{fa,fa-info-circle}} **Properties** menu. This image will show up in social media links.

  Fixes issues: [#820](https://github.com/naturalcrit/homebrewery/issues/820)
}}

### Wednesday 27/03/2022 - v3.0.8
{{taskList
* [x] Style updates to user page.

* [x] Added a logout button (finally)! You can find it under {{openSans **USERNAME {{fa,fa-user}} → LOGOUT {{fas,fa-power-off}}**}}

	Fixes issues: [#303](https://github.com/naturalcrit/homebrewery/issues/303)

* [x] Clarified the default text when submitting an issue via Reddit post.

* [x] Fixed broken Table of Contents links in PDFs. (Thanks lucastucious!)

	Fixes issues: [#1749](https://github.com/naturalcrit/homebrewery/issues/1749)

* [x] Fixed window resizing causing the edit page divider to get lost off of the edge of the page.

	Fixes issues: [#2053](https://github.com/naturalcrit/homebrewery/issues/2053)

* [x] Fixed Class Table decorations overlapping main text.

	Fixes issues: [#1985](https://github.com/naturalcrit/homebrewery/issues/1985)

* [x] Updated {{openSans **STYLE EDITOR {{fa,fa-pencil-alt}} → REMOVE DROP CAP {{fas,fa-remove-format}}**}} snippet to also remove small-caps first line font.

* [x] Background work in preparation for brew themes.
}}

### Wednesday 02/02/2022 - v3.0.7
{{taskList
* [x] Revert active line highlighting.

	Fixes issues: [#1913](https://github.com/naturalcrit/homebrewery/issues/1913)

* [x] Added install steps for Ubuntu. [HERE](https://github.com/naturalcrit/homebrewery/blob/master/install/README.UBUNTU.md)

	Fixes issues: [#1900](https://github.com/naturalcrit/homebrewery/issues/1900)

* [x] Added social media links to home page.

* [x] Increase brews visible on the user page to 1,000.

	Fixes issues: [#1943](https://github.com/naturalcrit/homebrewery/issues/1943)

* [x] Added a Legacy to V3 migration guide under {{openSans **NEED HELP? {{fa,fa-question-circle}} → MIGRATE {{fas,fa-file-import}}**}}

* [x] Background refactoring and unit tests.
}}

### Saturday 18/12/2021 - v3.0.6
{{taskList
* [x] Fixed text wrapping for long strings in code blocks.

	Fixes issues: [#1736](https://github.com/naturalcrit/homebrewery/issues/1736)

* [x] Code search/replace PC: `CTRL F / CTRL SHIFT F` / Mac: `CMD F / OPTION CMD F`

	Fixes issues: [#1201](https://github.com/naturalcrit/homebrewery/issues/1201)

* [x] Auto-closing HTML tags and curly braces `{{ }}`
* [x] Highlight current active line

	Fixes issues: [#1202](https://github.com/naturalcrit/homebrewery/issues/1202)

* [x] Display tabs and trailing spaces

	Fixes issues: [#1622](https://github.com/naturalcrit/homebrewery/issues/1622)

* [x] Make columns even in V3 Table of Contents.

	Fixes issues: [#1671](https://github.com/naturalcrit/homebrewery/issues/1671)

* [x] Fix `CTRL P` failing to print from `/new` pages.

	Fixes issues: [#1815](https://github.com/naturalcrit/homebrewery/issues/1815)
}}

\page

### Tuesday 07/12/2021 - v3.0.5
{{taskList
* [x] Fixed paragraph spacing for **note** and **descriptive** boxes in V3.

	Fixes issues: [#1836](https://github.com/naturalcrit/homebrewery/issues/1836)

* [x] Added a whole bunch of hotkeys:

  * Page Break `CTRL + ENTER`
  * Column Break `CTRL + SHIFT + ENTER`
  * Bulleted Lists `CTRL + L`
  * Numbered Lists `CTRL + SHIFT + L`
  * Headers `CTRL + SHIFT + (1-6)`
  * Underline `CTRL + U`
  * Link `CTRL + K`
  * Non-breaking space (\&nbsp;) `CTRL + .`
  * Add Horizontal Space `CTRL + SHIFT + .`
  * Remove Horizontal Space `CTRL + SHIFT + ,`
  * Curly Span `CTRL + M`
  * Curly Div `CTRL + SHIFT + M`

* [x] Fixed page numbers in the editor panel getting scrambled when scrolling up and down.

* [x] Faster swapping between tabs on long brews.

* [x] Better error messages for common issue with Google Drive credentials expiring.
}}

### Wednesday 17/11/2021 - v3.0.4
{{taskList
* [x] Fixed incorrect sorting of Google brews by page count and views on the user page.

	Fixes issues: [#1793](https://github.com/naturalcrit/homebrewery/issues/1793)

* [x] Added code folding! Only on a page-level for now. Hotkeys `CTRL + [` and `CTRL + ]` to fold/unfold all pages. (Thanks jeddai, new contributor!)

	Fixes issues: [#629](https://github.com/naturalcrit/homebrewery/issues/629)

* [x] Fixed rendering issues due to the latest Chrome update to version 96. (Also thanks to jeddai!)

	Fixes issues: [#1828](https://github.com/naturalcrit/homebrewery/issues/1828)
}}

### Wednesday 27/10/2021 - v3.0.3

{{taskList
* [x] Moved **Post To Reddit** button from {{fa,fa-info-circle}} **Properties** menu to the **SHARE** {{fa,fa-share-alt}} button as a dropdown.

* [x] Added a  **Copy URL** button to the **SHARE** {{fa,fa-share-alt}} button as a dropdown.

* [x] Fixed pages being printed directly from `/new` not recognizing the V3 renderer.

	Fixes issues: [#1702](https://github.com/naturalcrit/homebrewery/issues/1702)

* [x] Updated links to [r/UnearthedArcana](https://www.reddit.com/r/UnearthedArcana/) on home page.

	Fixes issues: [#1744](https://github.com/naturalcrit/homebrewery/issues/1744)

* [x] Added a [FAQ page](https://homebrewery.naturalcrit.com/faq).

	Fixes issues: [#810](https://github.com/naturalcrit/homebrewery/issues/810)

* [x] Added {{fa,fa-undo}} **Undo** and {{fa,fa-redo}} **Redo** buttons to the snippet bar.

}}

\column

{{taskList

* [x] Switching between the {{fa,fa-beer}} **Brew** and {{fa,fa-paint-brush}} **Style** tabs no longer loses your scroll position or undo history.

	Fixes issues: [#1735](https://github.com/naturalcrit/homebrewery/issues/1735)

* [x] Divider bar between editor and preview panels can no longer be dragged off the edge of the screen.

	Fixes issues: [#1674](https://github.com/naturalcrit/homebrewery/issues/1674)
}}


### Wednesday 06/10/2021 - v3.0.2

{{taskList
* [x] Fixed V3 **EDITOR → QR Code** snippet not working on `/new` (unsaved) pages.

	Fixes issues: [#1710](https://github.com/naturalcrit/homebrewery/issues/1710)

* [x] Reorganized several snippets from the **Brew Editor** panel into the **Style Editor** panel.

	Fixes issues: [Reported on Reddit](https://www.reddit.com/r/homebrewery/comments/pm6ki7/two_version_of_class_features_making_it_look_more/)

* [x] Added a page counter to the right of each `\page` line in V3 to help navigate your brews. Starts counting from page 2.

	Fixes issues: [#846](https://github.com/naturalcrit/homebrewery/issues/846)

* [x] Moved the changelog to be accessible by clicking on the Homebrewery version number.

	Fixes issues: [#1166](https://github.com/naturalcrit/homebrewery/issues/1166)
}}

### Friday, 17/09/2021 - v3.0.1

{{taskList
* [x] Updated V3 **PHB → Class Feature** snippet to use V3 syntax.

	Fixes issues: [Reported on Reddit](https://www.reddit.com/r/homebrewery/comments/pm6ki7/two_version_of_class_features_making_it_look_more/)

* [x] Improved V3 **PHB → Monster Stat Block** snippet and styling to allow for easier control of paragraph indentation in the Abilities text.

  Fixes issues: [#181](https://github.com/naturalcrit/homebrewery/issues/181)

* [x] Improved Legacy **TABLES → Split Table** snippet by removing unneeded column-break backticks.

  Fixes issues: [#844](https://github.com/naturalcrit/homebrewery/issues/844)

* [x] Changed block elements to use CSS `width` instead of `min-width`. This should make custom styles behave more predictably when trying to resize items.

  Fixes issues: [Reported on Reddit](https://www.reddit.com/r/homebrewery/comments/pohoy3/looking_for_help_with_basic_stuff_in_v3/)

* [x] Fixed Partial Page Rendering in V3 for large brews

  Fixes issues: [Reported on Reddit](https://www.reddit.com/r/homebrewery/comments/pori3a/weird_behaviour_of_the_brew_after_page_50/)

* [x] Fixed HTML validation to handle tags starting with 'a', as in `<​aside>`.  

  Fixes issues: [#230](https://github.com/naturalcrit/homebrewery/issues/230)

* [x] Fixed page footers switching side when printing.

  Fixes issues: [#1612](https://github.com/naturalcrit/homebrewery/issues/1612)
}}


\page

### Saturday, 11/09/2021 - v3.0.0

We have been working on v3 for a *very* long time. We want to thank everyone for being paitent.


Some features planned for V3 have actually been released over the recent months as part of V2, and some are still on the way. But at its core, V3 provides brand new Markdown-to-Brew rendering system, which was no simple task. This has opened up access to all sorts of bugfixes, tweaks, and potential for new features that just wouldn't be possible on the old system.

***BE WARNED:*** As we continue to develop V3, expect small tweaks in the styling, fonts, and snippets; your brews may look slightly different from day-to-day; some things might break completely while we tackle any bugs in this early stage. All of your old documents will continue to work as normal. We are not touching them. If you don't want to deal With the possibility of slight formatting changes, you may choose to stick with the Legacy renderer on any of your brews for as long as you like. However, most new features added from now on will only be available for brews using the V3 renderer.

Massive changelog incoming:

#### Markdown+
With the latest major update to *The Homebrewery*, we've implemented an extended Markdown-like syntax for block and span elements, plus a few other changes, eliminating the need for HTML tags like `div`, and `span` in most cases. This should hopefully aid non-coders with readability, and also allows us a few tricks in the background to fix some old issues. No raw HTML tags should be needed in a brew, and going forward, raw HTML will no longer receive debugging support (*but can still be used if you insist*).

All brews made prior to the release of v3.0.0 will still render normally, and you may switch between the "Legacy" brew renderer and the newer "V3" renderer via the {{fa,fa-info-circle}} **Properties** button  on your brew. Much of the syntax and styling has changed in V3, so code in one version may be broken in the other.

Visit [this page](/v3_preview) for brief examples of the new syntax!

#### Extended Markdown Syntax:

{{taskList
* [x] Add Divs and Spans for all your custom styling needs, via a simplified Markdown-like syntax:
  ```
  {{myDivClass,#myId,color:red
  My Div content
  }}

  Hello {{mySpan,color:blue World}} !
  ```

  Fixes issues: [#348](https://github.com/naturalcrit/homebrewery/issues/348)
}}

\column

{{taskList
* [x] Add inline CSS to Markdown objects via "curly injection" syntax:
  ```
  Hello *world*{myClass,#id,color:red}
  ```
  Fixes issues: [#403](https://github.com/naturalcrit/homebrewery/issues/403)

* [x] Rowspan, Colspan, and multiple header rows with extended table syntax:
```
| Header 1a | Header 1b | Header 1c |
| Header 2a | Header 2b | Header 2c |
|:---------:|:----------|:---------:|
| Span 2 columns       || Span 2    |
| one col   |  one col  | rows     ^|
```
  Fixes issues: [#773](https://github.com/naturalcrit/homebrewery/issues/773), [#191](https://github.com/naturalcrit/homebrewery/issues/191)

* [x] Hanging indents via `<dl>` tags, as seen in the **PHB → Spell** snippet. Add via "double-colon" syntax:
```
Term :: big long definition that bleeds onto multiple lines
```
  Fixes issues: [#182](https://github.com/naturalcrit/homebrewery/issues/182), [#149](https://github.com/naturalcrit/homebrewery/issues/149)

* [x] Easier vertical spacing via colons alone on a line:
  ```
   :::
  ```
  Fixes issues: [#374](https://github.com/naturalcrit/homebrewery/issues/374)

* [x] Avoid paragraph indendation by ending the previous paragraph with a backslash `\` or two spaces `  `
  ```
  Paragraph one\
  Paragraph two
  ```
  Fixes issues: [#636](https://github.com/naturalcrit/homebrewery/issues/636)

* [x] Code blocks can be inserted by surrounding it with rows of three backticks ` ``` `, for demonstration purposes or to share custom styles. Inline-code can be inserted with single backticks <code>&#96;code&#96;</code>
 <pre><code>&#96;&#96;&#96;
 Here is some code!
&#96;&#96;&#96;
</code></pre>

  Fixes issues: [#465](https://github.com/naturalcrit/homebrewery/issues/465)

#### New and Fixed Snippets

* [x] Column breaks now use `\column` instead of ` ``` ` backticks.

  Fixes issues: [#607](https://github.com/naturalcrit/homebrewery/issues/607)

* [x] Page breaks using `\page` now only trigger when placed alone at the start of a line.

  Fixes issues: [#1147](https://github.com/naturalcrit/homebrewery/issues/1147)
}}

\page
{{taskList
* [x] New **EDITOR → QR Code** snippet.

  Fixes issues: [#538](https://github.com/naturalcrit/homebrewery/issues/538)

* [x] New **IMAGES → Watercolor Splatter** snippet, which adds one of a range of stylish stains to your brew.

* [x] New **IMAGES → Watermark** snippet, which adds transparent text diagonally across the page.

* [x] New **PHB → Magic Item** snippet.

  Fixes issues: [#671](https://github.com/naturalcrit/homebrewery/issues/671)

* [x] New **TABLES → 1/3 Class Table** snippet for 1/3 casters.

  Fixes issues: [#191](https://github.com/naturalcrit/homebrewery/issues/191)

* [x] Improved **EDITOR → Table of Contents** snippet to actually look like the PHB style. Will auto-generate based on the headers in your brew.

  Fixes issues: [#304](https://github.com/naturalcrit/homebrewery/issues/304)

* [x] Improved **PHB → Monster Stat Block** snippet with textures, and an option to remove the frame entirely.

* [x] Improved **PHB → Spell List** snippet can now be made single-column.

  Fixes issues: [#509](https://github.com/naturalcrit/homebrewery/issues/509), [#914](https://github.com/naturalcrit/homebrewery/issues/914)

* [x] Improved **TABLES → Class Table** snippet is now cleaned up, has an option to remove the frame entirely, and includes additional boundary decorations.

  Fixes issues: [#773](https://github.com/naturalcrit/homebrewery/issues/773), [#302](https://github.com/naturalcrit/homebrewery/issues/302)

#### Miscellaneous Formatting Fixes

* [x] Paragraphs are now able to split across columns.

  Fixes issues: [#239](https://github.com/naturalcrit/homebrewery/issues/239)

* [x] Multiple fixes for bold/italicize using asterisks `* *`

  Fixes issues: [#1321](https://github.com/naturalcrit/homebrewery/issues/1321), [#852](https://github.com/naturalcrit/homebrewery/issues/852)

* [x] Multiple for list items not displaying correctly.

  Fixes issues: [#1085](https://github.com/naturalcrit/homebrewery/issues/1085), [#588](https://github.com/naturalcrit/homebrewery/issues/588)

* [x] "Smart quotes", so left and right quotes are different.

  Fixes issues: [#849](https://github.com/naturalcrit/homebrewery/issues/849)

* [x] Long URLs in links now wrap properly.

  Fixes issues: [#1136](https://github.com/naturalcrit/homebrewery/issues/1136)

* [x] Better support for `wide` blocks that span across the whole page! No more problems with contents getting shunted off the edge, and each new wide element in a page will restart the next item back at column one. Manual `\column` breaks will help organize subsequent content between the columns as needed.

  Fixes issues: [#144](https://github.com/naturalcrit/homebrewery/issues/144), [#1024](https://github.com/naturalcrit/homebrewery/issues/1024)

* [x] Fonts now support a wider range of latin characters for non-English brews, including áéíóúñ¡¿, etc...

  Fixes issues: [#116](https://github.com/naturalcrit/homebrewery/issues/116)

* [x] Drop-caps (fancy first letters) have been re-styled and re-aligned to correct the ugly overlapping and cut-off on some characters like K and Y.

  Fixes issues: [#848](https://github.com/naturalcrit/homebrewery/issues/848)
}}

\column

### Under-the-Hood Stuff
We had to make a whole lot of background upgrades and changes to get all of this working, and now that the framework is in place, there's a lot more planned and upcoming *"sometime"* :

{{taskList
* [ ] New Themes to style your brews. DMG, MM, a custom Homebrewery theme, and others.
* [ ] The ability to build your own custom themes using CSS, apply it to other brews, and share it with others!
* [ ] Easy control of item colors. Change your monster blocks, tables, and notes from yellow to green to red!
* [ ] New image-based snippets, including handwritten notes, title illustrations, and alternative decorations.
* [ ] New fun fonts like Elvish, Draconic, Orcish, etc.
* [ ] Better organization of personal brews using tags.
* [ ] ....a log-out button...?
* [ ] AND MORE.
}}

### Interface
::
#### Style Editor Panel

{{fa,fa-paint-brush}} Technically released prior to v3 but still new to many users, check out the new **Style Editor** located on the right side of the Snippet bar.  This editor accepts CSS for styling without requiring `<style>` tags-- anything that would have gone inside style tags before can now be placed here, and snippets that insert CSS styles are now located on that tab.



\page
### Thursday, 09/09/2021 - v2.13.5
- Slightly better error logging and messages for users.

##### G-Ambatte :
- Added a search bar to the User page to help find your brews.
- Added page counts to brews in the User page; page count will be updated the next time a brew is edited.
- Fixed edge case where view counts could get reset.
- Fixed edge case where last-modified time was not accurate for Google Doc brews.

##### Gazook89 :
- Fixed typo in the **PRINT → Ink-Friendly** snippet.



### Tuesday, 17/08/2021 - v2.13.4
- Fixed User page crashing when user has an untitled brew

##### G-Ambatte:
- Tweaks to user page tool tips
- Fix view counts being reset on Google Drive files

##### Gazook89 :
- New **PHB → Artist Credit** snippet
- **PRINT** snippets moved to the **Style Editor** tab

### Monday, 09/08/2021 - v2.13.3

##### G-Ambatte :
- Tooltips hovering over brews in dropdowns / user page.
- Fixed sort-by created date on user page.

##### Gazook89 :
- Hotkey Ctrl-/ and snippets to add HTML comments; use for notes that won't appear in your brew.

### Friday, 30/07/2021 - v2.13.2

- Background work to allow new themes in the future
- Fixed cursor getting stuck when resizing divider bar

##### G-Ambatte :
- Fix Style tab not copying when Cloned To New
- Basic brew sorting on User page
- Reduced data sent on each request from server

##### Gazook89 :
- Cleaned up styling on menus

### Saturday, 28/6/2021 - v2.13.1

- Fixed the issue with new brews not saving!

### Saturday, 26/6/2021 - v2.13.0

- "Share to Reddit" button now works with Google brews
- Downloading or viewing the source of your brew will now show the contents of the Style tab at the top of the document in a backtick code fence like this:

\`\`\`css

myStyle {color: black}

\`\`\`

##### G-Ambatte :
- New **Download**, **View**, and **Clone to New** buttons in the "Source" dropdown on the Share page.
- Pasting your brew into a "New" page and saving will transfer any CSS in the code fence to the Style tab.
- Unsaved work in the New page Style tab is now cached to your browser storage if you navigate away.

### Thursday, 10/6/2021 - v2.12.0

- New "style" tab to better organize custom CSS in preparation for new themes and sharable styles.
- Your own Google brews will no longer show up in the list when viewing someone else's profile.

### Saturday, 02/5/2021 - v2.11.2

- Fix for edge case where brews could accidentally transfer from Google Drive back to Homebrewery.
- Move cursor to end of snippet after insertion

\page

### Saturday, 20/3/2021 - v2.11.1

- Warning when opening brew in your Google Drive trash

##### G-Ambatte :
- Snippet to remove drop caps (fancy first letter after title)

### Saturday, 13/3/2021 - v2.11.0

- Many background things for upcoming v3. Get pumped.

##### G-Ambatte :
- Fixed new brews failing to save when auto-generated file name is too long.
- "New" button added to the Nav bar.
- "Download" button to download your brew as a text file.
- Reduced download size and improved caching.

##### RKuerten :
- Bold and Italics hotkeys for Mac users (Cmd+B, Cmd+I)

### Friday, 25/1/2021 - v2.10.7
- Cover Page snippet now flips left-right page numbering.
- Added instructions for [installing on a FreeBSD Jail](https://github.com/naturalcrit/homebrewery/blob/master/README.FREEBSD.md).
- Fix for box-shadows breaking across columns. <br>(Thanks G-Ambatte for all of these!)
- Small user interface tweaks (Thanks Ericsheid)

### Friday, 02/1/2021 - v2.10.6
- Fixed punctuation for usernames ending with 's' on the user page. (Thanks AlexeySachkov)
- Fixed server crashes due to excessive long lines in brews
- Fixed "automated request" lockouts from Google

### Friday, 18/12/2020 - v2.10.5
- Brews now immediately save when transferring between Google Drive and Homebrewery storage.
- Added confirmation popup to clarify the transfer process.
- Brews transferred or deleted from Google will be found in your Google Drive trash.
- Dependency updates.

### Wednesday, 25/11/2020 - v2.10.4
- Fixed Google Drive brews not saving metadata (view count, description, etc.) Note that we are still working on making published Google brews visible to the public when viewing your profile page.

\column

### Thursday, 22/10/2020 - v2.10.3
- Fixed brews with broken code crashing the edit page when loaded (the "blue screen of death" bug).

### Monday, 19/10/2020 - v2.10.2
- Fixed issue with "recent" item links not updating when transferring between Google Drive.

### Monday, 12/10/2020 - v2.10.1
- Fixed issue with users unable to create new brews
- Fixing brews being lost when loaded via back button

### Wednesday, 07/10/2020 - v2.10.0
- Google Drive integration -- Sign in with your Google account to link it with your Homebrewery profile. A new button in the Edit page will let you transfer your file to your personal Google Drive storage, and Google will keep a backup of each version! No more lost work surprises!

### Friday, 28/08/2020 - v2.9.2
- Many dependency updates
- Finally fixed this changelog page to not run off the edge :P

### Sunday, 19/07/2020 - v2.9.1
- Fixed paragraphs appearing blank on new columns

### Wednesday, 20/05/2020 - v2.9.0
- Major refactoring of site backend to work with updated dependencies for security (should be invisible to users)

### Wednesday, 11/03/2020 - v2.8.2
- Fixed delete button removing everyone's copy for brews with multiple authors
- Compressed homebrew text in database

### Monday, 26/11/2018 - v2.8.1
- Fixed some SSL issues with images in the example page so they appear now
- Fixed duplicate scrollbars in Edit Page
- Fixed issue of being unable to change brew metadata
- Sanitized script tags-javascript typed into the editor was crashing brews

### Sunday, 08/04/2018 - v2.8.0
- Re-enabled box shadows for PDF output
- Added a "contributing guide" for the GitHub
- "Report Issue" navbar button now links to the subreddit
- Refactored background code

\page

### Sunday, 04/06/2017 - v2.7.5
- Fixed Class Feature snippet duplicating entire brew
- Fixed headers in tables being duplicated
- Fixed border-image being scrambled on class tables and descriptive text boxes
- Fixed pages going out of sync in large brews, causing them to be rendered off-page
- Improved performance in the preview window when scrolling through large brews
- Text in the "view source" page now wraps

### Saturday, 22/04/2017 - v2.7.4
- Give ability to hide the render warning notification

### Friday, 03/03/2017 - v2.7.3
- Increasing the range on the Partial Page Rendering for a quick-fix for it getting out of sync on long brews.

### Saturday, 18/02/2017 - v2.7.2
- Adding ability to delete a brew from the user page, incase the user creates a brew that makes the edit page unrender-able. (re:309)

### Thursday, 19/01/2017 - v2.7.1
- Fixed saving multiple authors and multiple systems on brew metadata (thanks u/PalaNolho re:282)
- Adding in line highlight for new pages
- Added in a simple brew lookup for admin

### Saturday, 14/01/2017 - v2.7.0
- Added a new Render Warning overlay. It detects situations where the brew may not be rendering correctly (wrong browser, browser is zoomed in...) and let's the user know

### Sunday, 25/12/2016 - v2.7.0
- Switching over to using Vitreum v4
- Removed gulp, all tasks are run through npm scripts
- Updating docs for local dev
- Removing support for Docker. I have never used it, nor will I ever test for it, so I don't want to continue to explictly support it on this repo. Feel free to make a fork and make it docker-able though :)
- Changed icon for the metadata
- Made links useable in footer (thanks u/Dustfinger1 re:249)
- Added print media queries to remove box shadow on print (thanks u/dmmagic  re: 246)
- Fixed realtime renderer not functioning if loaded with malformed html on load (thanks u/RattiganIV re:247)
- Removed a lot of unused files in shared
- vitreum v4 now lets me use codemirror as a pure node dependacy

\column

### Saturday, 03/12/2016 - v2.6.0
- Added report back to the edit page
- Changed metaeditor icon
- Added a button to quickly share your brew to reddit :)
- Disabled Partial Page Rendering unless your brew hits 75 pages or longer
- The brew renderer will now try and use your first page to judge the page size of each of your brews. This allows you now to set landscape and other weird sizes and everthing should work fine :)
- UI on the user page improved (thanks u/PalaNolho)
- Fixed lists not breaking across columns (thanks u/tyson-nw)
- Added a table of contents snippet (thanks u/tullisar)
- Added a multicolumn snippet

### Thursday, 01/12/2016
- Added in a snippet for a split table
- Added an account nav item to new page

### Sunday, 27/11/2016 - v2.5.1
- Fixed the column rendering on the new user page. Really should have tested that better
- Added a hover tooltip to fully read the brew description
- Made the brew items take up only 25% allowing you to view more per row.

### Wednesday, 23/11/2016 - v2.5.0
- Metadata can now be added to brews
- Added a metadata editor onto the edit and new pages
- Moved deleting a brew into the metadata editor
- Added in account middleware
- Can now search for brews by a specific author
- Editing a brew in anyway while logged in will now add you to the list of authors
- Added a new user page to see others published brews, as well as all of your own brews.
- Added a new nav item for accessing your profile and logging in

### Monday, 14/11/2016
- Updated snippet bar style
- You can now print from a new page without saving
- Added the ability to use ctrl+p and ctrl+s to print and save respectively.

### Monday, 07/11/2016
- Added final touches to the html validator and updating the rest of the branch
- If anyone finds issues with the new HTML validator, please let me know. I hope this will bring a more consistent feel to Homebrewery rendering.

\page

### Friday, 09/09/2016 - v2.4.0
- Adding in a HTML validator that will display warnings whenever you save. This should stop a lot of the issues generated with pages not showing up.

### Saturday, 20/08/2016 - v2.3.0
- Added in a license file
- Updated the welcome text
- Added in a much better Error page
- If you visit a deleted brew, it will now remove it from your recent list. (Thanks u/sIllverback!)
- Improved parsing of embedded html text in brews. (Thanks u/com-charizard!)
- Added in a new coverpage snippet
- Homebrewery will now try and onsert a good title for your brew if you don't provide one
- Homebrewery now re-renders properly when you zoom
- Fixed the noteblock overlapping into titles (thanks u/dsompura!)
- Fixed a bad search route in the admin panel (thanks u/SnappyTom!)

### Friday, 29/07/2016 - v2.2.7
- Adding in descriptive note blocks. (Thanks calculuschild!)

### Thursday, 07/07/2016 - v2.2.6
- Added a new nav item on the homepage for accessing both recently viewed and edited brews (thanks [ChosenSeraph!](https://github.com/stolksdorf/homebrewery/issues/147))

### Friday, 10/06/2016 - v2.2.4
- Added an id to each rendered page
- Allows adding in hyperlinks to specific pages
- Even works after you print to pdf!

### Tuesday, 07/06/2016 - v2.2.2
- Fixed bug with new markdown lexer and parser not working on print page

### Sunday, 05/06/2016 - v2.2.1
- Adding in a new Class table div block. The old Class table block used weird stacking of HTML elements, resulting is difficult to control behaviour and poor interactiosn with the rest of the page. This new block is much easier to style and work with.
- Added in a new wide table snippet
- Added in a new auto-incremeting page number snippet (thakns u/Ryrok!)
- Lists in monster stat blocks should be fixed now

\column

### Saturday, 04/06/2016 - v2.2.0
- Migrating The Homebrewery over to hombrewery.naturalcrit.com. It now runs on it's own server, with it's own repo separate from the other tools I'm working on. Makes updating and deploying much easier.

### Sunday, 29/05/2016 - v2.1.0
- Finally added a syntax for doing spell lists. A bit in-depth about why this took so long. Essentially I'm running out of syntax to use in stardard Markdown. There are too many unique elements in the PHB-style to be mapped. I solved this earlier by stacking certain elements together (eg. an `<hr>` before a `blockquote` turns it into moster state block), but those are getting unweildly. I would like to simply wrap these in `div`s with classes, but unfortunately Markdown stops processing when within HTML blocks. To get around this I wrote my own override to the Markdown parser and lexer to process Markdown within a simple div class wrapper. This should open the door for more unique syntaxes in the future. Big step!
- Override Ctrl+P (and cmd+P) to launch to the print page. Many people try to just print either the editing or share page to get a PDF. While this dones;t make much sense, I do get a ton of issues about it. So now if you try to do this, it'll just bring you imediately to the print page. Everybody wins!
- The onboarding flow has also been confusing a few users (Homepage → new → save → edit page). If you edit the Homepage text now, a Call to Action to save your work will pop-up.
- Added a 'Recently Edited' and 'Recently Viewed' nav item to the edit and share page respectively. Each will remember the last 8 items you edited or viewed and when you viewed it. Makes use of the new title attribute of brews to easy navigatation.
- Paragraphs now indent properly after lists (thanks u/slitjen!)

### Friday, 27/05/2016 - v2.0.6
- Updated the issue template for (hopefully) better reporting
- Added suggestion to use chrome while PDF printing

### Wednesday, 25/05/2016 -v2.0.5
- The class table generators have the proper ability score improvement progression.

\page

### Tuesday, 24/05/2016 - v2.0.4
- Fixed extra wide monster stat blocks sometimes only being one column
- The class table generators now follow the proper progression from the PHB (thakns u/IrishBandit)

### Thursday, 19/05/2016 - v2.0.2

- No longer server-side pre-render brews, just incase the user entered invalid HTML, it might crahsh the server
- Bumped up the allowed entity size for extra-large brew (Thanks for reporting it dickboner93)
- Added a little error box when a save fails with a custom link to reporting the issue on github.

### Saturday, 14/05/2016 - v2.0.0 (finally!)

I've been working on v2 for a *very* long time. I want to thank you guys for being paitent.
It started rather small, but as more and more features were added, I decided to just wait until everything was polished.

Massive changelog incoming:

#### Brews
- New flow for creating new brews. Before creating a new brew would immedaitely create a brew in the database and let you edit it. Many people would create a new brew just to experiment and close it, which lead to many "abandoned brews" (see the Under the hood section below). This started eating up a ton of database space. You now have to manually save a new brew for the first time, however Homebrewery will store anything you don't have saved in local storage, just in case your browser crashes or whatever, it will load that up when you go back to `/homebrew/new`
- Black blocking edges around notes and stat blocks when printing to PDFs have been fixed
- Borders sometimes not showing up in the second column have been fixed
- All pseudo-element borders have been replaced with reliable border images.
- Chrome can finally print to PDF as good as Chrome Canary! Updating instructions.
- Added a little page number box.
- Added in a new editable Brew Title. This will be shown in the navbar on share pages, and will default to the file name when you save as PDF. All exsisting brews will be defaulted with an empty title.
- Mutliline lists render better now
- Firefox rendering has been slithgly improved. Firefox and Chrome render things **slightly** differently, over the course of a brew, these little changes add up and lead to very noticable rendering differences between the browsers. I'm trying my best to get Firefox rendering better, but it's a difficult problem.
- A bunch of you have wanted to donate to me. I am super flattered by that. I created a [patreon page](https://www.patreon.com/stolksdorf). If you feel like helping out, head here :)

#### Under the Hood Stuff
- Setup a proper staging environment. Will be using this for tests, and hopefully getting the community to help me test future versions
- Server-side prerendering now much faster
- Regular weekly database back-ups. Your brews are safe!
- Database is now uniquely indexed on both editId and shareId, page loads/saving should be much faster
- Improved Admin console. This helps me answer people's questions about issues with their brews
- Added a whole querying/pagniation API that I can use for stats and answering questions
- Clearing out "Abandoned" brews (smaller than a tweet and haven't been viewed for a week). These account for nearly a third of all stored brews.

#### Interface
- Added in a whole new editor with syntax highlighting for markdown
- Built a splitpane! Remembers where you left the split in between sessions
- Re-organized the snippets into a hierarchical groups. Should be much easier to find what you need
- Partial page rendering is working. The Homebrewery will now only load the viewable pages, and any page with `<style>` tags on them. If you are working on a large brew you should notice *significant* performance improvements
- Edit page saving interface has been improved significantly. Auto-saves after 3 seconds on inactivity, now allows user to save at anytime. Will stop the tab from closing witha  pop-up if there are unsaved changes.
- Navbar and overall style has been improved and spacing made more consistent
- Elements under the hood are way more organized and should behaviour much more reliably in many sizes.
- Source now opens to it's own route `/source/:sharedId` instead of just a window. Now easier to share, and won't be blocked by some browsers.
- Print page now auto-opens print dialog. If you want to share your print page link, just remove the `?dialog=true` parameter and it won't open the dialog.

\page

### Wednesday, 20/04/2016
- A lot of admin improvements. Pagninated brew table
- Added a searching and removing abandoned brew api endpoints (turns out about 40% of brews are shorter that a tweet!).
- Fixed the require cache being cleared. Pages should render a bit faster now.
- Pulled in `kkragenbrink`s fix for nested lists, Thanks!


### Wednesday, 06/04/2016 - v1.4
* Pages will now partially render. This should greatly speed up *very* large homebrews. The Homebreery will figure out which page you should be looking at and render that page, the page before, and the page after.
* Zooming should be fixed. I've changed the font size units to be cm, which match the units of the page. Zooming in and out now look much better.


### Monday, 29/02/2016 - v1.3.1
* Removng the changelog button from the Share page
* Added a A4 page size snippet (thanks 	guppy42!)
* Added support for `<sup>` and `<sub>` tags (thanks crashinworld14!)

### Saturday, 20/02/2016
* Fixed h1 headers not going full width (thanks McToomin27)
* Added a github issue template

## v1.3.0

### Friday, 19/02/2016
* Improved the admin panel
* Added ability to clear away old empty brews
* Added delete button to the edit page
* Added a dynamically updating changelog page! Nifty!
* Added stlying for wide monster stat blocks and single column class tables
* Added snippets for wide monster stat blocks and single column class tables

### Tuesday, 16/02/2016
* Paragraphs right after tables now indent (thanks LikeAJi6!)
* Added a `@page` css rule to auto turn off margins when printing
* Added a `page-break` property on each `.phb` page to properly page the pages up when exporting (thanks Jokefury!)
* Improved first character rendering on Firefox
* Improved table spacing a bit
* Changed padding at page bottom for better fit and clipping of elements
* Improved spacing for bold text (thanks nickpunt!)


## v1.2.0

### Sunday, 17/01/2016
* Added a printer friendly snippet that injects some CSS to remove backbrounds and images
* Adjusted the styling specific to spell blocks to give it tighter spacing
* Added a changelog! How meta!

## v1.1.0

### Thursday, 14/01/2016
* Added view source to see the markdown that made the page
* Added print view
* Fixed API issues that were causing the server to crash
* Increased padding on table cells
* Raw html now shows in view source

## v1.0.0 - Release

### Wednesday, 3/01/2016

* Added `phb.standalone.css` plus a build system for creating it
* Added page numbers and footer text
* Page accent now flips each page
