# changelog

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
- Fixed bug with new markdown lexer and aprser not working on print page

### Sunday, 05/06/2016 - v2.2.1
- Adding in a new Class table div block. The old Class table block used weird stacking of HTML elements, resulting is difficult to control behaviour and poor interactiosn with the rest of the page. This new block is much easier to style and work with.
- Added in a new wide table snippet
- Added in a new auto-incremeting page number snippet (thakns u/Ryrok!)
- Lists in monster stat blocks should be fixed now


### Saturday, 04/06/2016 - v2.2.0
- MIgrating The Homebrewery over to hombrewery.naturalcrit.com. It know runs on it's own server, with it's own repo separate from the other tools I'm working on. Makes updating and deploying much easier.

\page

### Sunday, 29/05/2016 - v2.1.0
- Finally added a syntax for doing spell lists. A bit in-depth about why this took so long. Essentially I'm running out of syntax to use in stardard Markdown. There are too many unique elements in the PHB-style to be mapped. I solved this earlier by stacking certain elements together (eg. an `<hr>` before a `blockquote` turns it into moster state block), but those are getting unweildly. I would like to simply wrap these in `div`s with classes, but unfortunately Markdown stops processing when within HTML blocks. To get around this I wrote my own override to the Markdown parser and lexer to process Markdown within a simple div class wrapper. This should open the door for more unique syntaxes in the future. Big step!
- Override Ctrl+P (and cmd+P) to launch to the print page. Many people try to just print either the editing or share page to get a PDF. While this dones;t make much sense, I do get a ton of issues about it. So now if you try to do this, it'll just bring you imediately to the print page. Everybody wins!
- The onboarding flow has also been confusing a few users (Homepage -> new -> save -> edit page). If you edit the Homepage text now, a Call to Action to save your work will pop-up.
- Added a 'Recently Edited' and 'Recently Viewed' nav item to the edit and share page respectively. Each will remember the last 8 items you edited or viewed and when you viewed it. Makes use of the new title attribute of brews to easy navigatation.
- Paragraphs now indent properly after lists (thanks u/slitjen!)

### Friday, 27/05/2016 - v2.0.6
- Updated the issue template for (hopefully) better reporting
- Added suggestion to use chrome while PDF printing

### Wednesday, 25/05/2016 -v2.0.5
- The class table generators have the proper ability score improvement progression.

### Tuesday, 24/05/2016 - v2.0.4
- Fixed extra wide monster stat blocks sometimes only being one column
- The class table generators now follow the proper progression from the PHB (thakns u/IrishBandit)

### Thursday, 19/05/2016 - v2.0.2

- No longer server-side pre-render brews, just incase the user entered invalid HTML, it might crahsh the server
- Bumped up the allowed entity size for extra-large brew (Thanks for reporting it dickboner93)
- Added a little error box when a save fails with a custom link to reporting the issue on github.

\page

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

