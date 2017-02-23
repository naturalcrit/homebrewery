## Session Todo

- Add in the `/test` page
- Add in the `/static` folder, welcome, changelog, testBrew
- Add in a /style route for seeing a brew's style
  - Clicking source should open both

- Setup a basic search page. (just loads all the brews right now).

- Make sure the brewrenderer is working perfectly
- Make sure the brewrenderer is loading the depricated styles as well
- Generate the old phb styles?
- Remove inlining the images and fonts

- Move the phb styling into `/shared/phb_style`
  - Break out the fonts and images
  -






### v3.0.0
- [x] Add better error messaging for not having mongo running
- [x] Remove Docker support
- [x] Improve docs, explain what that project is
- [ ] Default node_env in configs using nconf (default to local)
- [x] Make a `dev.routes.js` file to store things like login and search
- [x] Figure out why prod builds are breaking (set the right babelrc?)
- [x] Remove old brew editor and brew renderer files
- [x] Change icon on editor bar to a menu icon
- [x] Upgrade to Vitreum v4
- [x] Add in `egads` for error handling
- [x] Fix Changelog spacing
- [ ] Add `NODE_ENV` vars to staging and prod servers
- [ ] Add your own MIT license link, https://github.com/remy/mit-license
  - [ ] Remove `license` file, move it to the readme
- [x] split out a brew.routes, brew.api, dev.routes, and admin.routes
- [x] Add a thumbnail link to the metadata
- [ ] Share page should still load with JS turned off


#### Account
- [x] Make login self contained
- [x] Add a faked internal login page/route
- [ ] Fix styling on user page for items
- [ ] Add in a logout to user page

#### Search
- [x] Implement the search api, with pagniation
- [x] Add in a `search.test.js` for deedicated search tests
- [x] Finish tests for sorting and pagniation
- [ ] Add in a `markdown.test.js` file

#### Admin
- [x] Fix search API for admin?
- [x] Add a share -> edit id lookup on admin page
- [x] Add a version field to each brew
- [x] Should use a header to store and send the admin key, not a query param

#### Editing
- [x] Remove support for HTML tags
- [x] Make a separate style editor
- [ ] Add in a `\column` to replace the code blocks
- [ ] Add in styling for the code blocks now
- [x] Add in a new 'block' markdown element that creates simple divs with classes `{{myBlock }}`
- [ ] Add syntax highlighting for the new blocks
- [x] In the markdown parser, if unclosed blocks, add them to the end of the page.
- [x] Add comma support to the block syntax
- [ ] Have a triple ediotr selector in the menubar for markdown, style, and meta
- [ ] Add a css validator for the style
- [ ] Propogate up both markdown and style errors (maybe?)
~~- [ ] Make a way to have people add 'id' to blocks? NOPE, bad idea, can't use PPR then~~
- [ ] Make a test brew that loads the edit page at `/test`
  - This should use all the snippets and features through the doc

#### Rendering
- [ ] Rewrite the phb.style to support the new div-centered
- [ ] Add a 'brushed' class using the borderimage prop to add a brushed border (http://homebrewery.naturalcrit.com/share/HJmEWQCEj)
- [ ] If ver1 of brew, uses old rendering code and style
- [ ] Cold storage one last compile of the phb.old.css to use for old rendering
- [ ] Move all 'old' files (markdown renderer, old phb style etc.) to it's own folder. (./shared/depreciated)
- [ ] Headers should add their content to an id
- [ ] Switch over to completely use PPR
- [ ] Blend the box-shadow into the border images
- [ ] Make the horizontal rule have a better background image for the red triangle
- [ ] Notes and monsterblocks should just use blocks now,
- [ ] Have blockquotes make actual quotes (PHB p.18)
- [ ] Add color modifier classes (green, purple, brown, teal), used for notes and tables

#### UX
- [x] Add syntax highlighting to a `\page` line
- [ ] Look into snapping from editor position -> renderer position
- [x] Break the ctrl => keys into a little util
- [x] Add the metadata editor button back to homepage
- [ ] Create a `/docs` folder for the markdown text to auto-read it
  - [ ] Add in a faq.md, and move the changelog.d and welcome.md here
- [ ] On Split move, fix the cursor position
    - Maybe have to add a component ref passthrough to pico-flux
- [ ] Make a smart brewtitle navitem
  - [ ] Can pass prop to make it editable via actions
- [x] Make a navitems.js file which makes to all the navitems
- [ ] Add a `small` modifier to nav items to shrink the text
- [ ] Make the recent brew nav item work with the new errors to remove
  - [ ] Clean up the recent nav item to just show both

#### Snippets
- [ ] Add a 'credits' snippet
- [ ] Change snippetbar to menubar
- [ ] Split snippets up into two folders, for style and markdown.
- [ ] Move snippets into shared
  - [ ] Split each snippet into it's own file? Or at least organize them better