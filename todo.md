# The Homebrewery

### v2.4.0 todo
- [ ] Match style of snippet bar to TPK
- [ ] Add 'Snippets' tag to bar
- [ ] Add an FAQ page
  - How to add images
  - How to add background images
  - Pages not appearing
  - Rendering is weird
  - How to print to PDF
- [ ] Remove ver and each page
- [ ] Use pass-through express routes (like in tpk)
- [ ] Add feature of printing from just the new page/local storage
- [ ] remove save warning on new page


## v2.0.0 todo
X make a proper staging environment
X make database backups
X Cleanup master
X Make statusbar un-fixed
X Simplify the panel css to remove the current issues
X Build new `BrewRenderer`, clean support for partial rendering
X Add `infoBox` to BrewRenderer to show views, and current pages
X remove old status bar
X remove jsoneditor (if we don't need it)
X Add in markdown editor
X Add the '/new' page and force save to reduce database size
X Add pagniation and query to the homebrew api
X Update the admin page with pagnition and a query box
X Test the old/small brew filtering for deleteion
X Partial rendering kills style tags on unrendered pages. Detect if pages have style tags and render them.
X Add in the link of Pateron
X Add in a localstorage fallback on the `/new` page, clear it when they save
X Rename `/client/naturalCrit` -> `/client/main`
X Move snippets into their new groups
X Replace pseudo-elements with encoded images
  X Encode the images into base64 and embed
  X Add in note wings
X Border shadows on second column renders much better
X Saving a pdf no uses the brew title
X add /source/shareId route
X make both ids unique indexes in mongoose
X Fix main Page
X Write new welcome message
X Fix the edit page saving flow
X Fix title saving
X Style the snippet groups
X Update changelog
X Print Dialog now auto-opens on print page

- fixed multiline lists (u/Zagorath)

## v2.1.0
- Add stats nav item
- Add a "Hotness" indicator based on the number of views
- Adda better error page
- IMproved firefox support
- Add in window.resize handlers for the elements that need it
- Make hybrid editor and brewRenderer (with resize listeners)
- Add in brew title, use for metadata?
- Add error handling to the saving wdiget in the status bar
  - Should provide error dump to copy and a link to github issues page
- Look into improving the metadata on pages for linking
- Add in a tutorial page?
- Increase post entity limit size, http://stackoverflow.com/questions/15627573/nodejs-express-request-entity-too-large-heroku

## v2.2
- User accounts!
  - Add a new database model
  - Make sure you salt those passwords
  - Add a new `/user/id` page
  - Should be able to change username and password
  - render and show all of thier brews
  -


# SpellSort

## v0.1
- Query text box
  - should support `has:somatic`, `class:wizard`, `school:divination`, `level:6`
- Add a dropdown box with clickable elements to inject search terms
- Clean up the 5th edition spells json


