# changelog


### Wednesday, 20/04/2016
- A lot of admin improvements. Pagninated brew table
- Added a searching and removing abandoned brew api endpoints (turns out about 40% of brews are shorter that a tweet!).
- Fixed the require cache being cleared. Pages should render a bit faster now.


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

