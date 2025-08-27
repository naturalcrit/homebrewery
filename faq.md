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
{{wide Updated Apr. 15, 2023}}


### The site is down for me! Anyone else?

You can check the site status here: [Everyone or Just Me](https://downforeveryoneorjustme.com/homebrewery.naturalcrit.com)

### Why am I getting an error when trying to save, and my account is linked to Google?

A sign-in with Google only lasts a year until the authentication expires.  You must go [here](https://www.naturalcrit.com/login), click the *Log-out* button, and then sign back in using your Google account.

### I lost my password, how do I reset it?  How do I change my password?

Homebrewery is specifically designed to not hold personal information as a measure to protect both users and admin, and does not require an email address.  Thus it would be difficult to send a new password to a user.  Reach out to the moderators on [the subreddit](https://www.reddit.com/r/homebrewery) with your Homebrewery username.  

If you have linked your account with a Google account, you would change your password within Google.

### Is there a way to restore a previous version of my brew?

In your brew, there is an icon, :fas_clock_rotate_left:, that button opens up a menu with versions of your brew, stored in order from newer to older, up to a week old. Because of the amount of duplicates this function creates, this information is stored in **your browser**, so if you were to uninstall it or clear your cookies and site data, or change computers, the info will not be there.

Also, we do have daily backups of our database that we keep for 8 days, and you can contact the moderators on [the subreddit](https://www.reddit.com/r/homebrewery) with your Homebrewery username, the name of the lost brew, and the last known time it was working properly. We can manually look through our backups and restore it if it exists.


### I worked on a brew for X hours, and suddenly all the text disappeared!

This usually happens if you accidentally drag-select all of your text and then start typing which overwrites the selection. Do not panic, and do not refresh the page or reload your brew quite yet as it is probably auto-saved in this state already. Simply press CTRL+Z as many times as needed to undo your last few changes and you will be back to where you were, then make sure to save your brew in the "good" state.

You can also load a history version old enough to have all the text, using the :fas_clock_rotate_left: history versions button.

\column

### Why is only Chrome supported?

Different browsers have differing abilities to handle web styling (or "CSS").  For example, Firefox is not currently capable of handling column breaks well but Chrome has no problem.  Also, each browser has slight differences in how they display pages which can make it a nightmare to compensate for.  These capabilities change over time and we are hopeful that each browser update bridges these gaps and adds more features; until then, we will develop with one browser in mind.

### Both my friend and myself are using Chrome, but the brews still look different.  Why?

A pixel can be rendered differently depending on the browser, operating system, computer, or screen.  Unless you and your friend have exactly the same setup, it is likely your online brew will have very tiny differences.  However, sometimes a few pixels is all it takes to create *big* differences....for example, an extra pixel can cause a whole line of text or even a monster stat block to run out of space in it's current column and be pushed to the next column or even off the page.  

The best way to avoid this is to leave space at the end of a column equal to one or two lines of text.  Or, create a PDF from your document for sharing--- PDF's are designed to be rendered the same on all devices.

### Why do I need to manually create a new page?  Why doesn't text flow between pages?

A Homebrewery document is at its core an HTML & CSS document, and currently limited by the specs of those technologies.  It is currently not possible to flow content from inside one box ("page") to the inside of another box.  It seems likely that someday CSS will add this capability, and if/when that happens, Homebrewery will adopt it as soon as possible.

### Where do I get images?
The Homebrewery does not provide images for use besides some page elements and example images for snippets.  You will need to find your own images for use and be sure you are following the appropriate license requirements.  

Once you have an image you would like to use, it is recommended to host it somewhere that won't disappear; commonly, people host their images on [Imgur](https://www.imgur.com).  Create an account and upload your images there, and use the *Direct Link* that is shown when you click into the image from the gallery in your Homebrewery document.

\page

### A particular font does not work for my language, what do I do?
The fonts used were originally created for use with the English language, though revisions since then have added more support for other languages. They are still not complete sets and may be missing a glyph/character you need. Unfortunately, the volunteer group as it stands at the time of this writing does not have a font guru, so it would be difficult to add more glyphs (especially complicated glyphs). Let us know which glyph is missing on the subreddit, but you may need to search [Google Fonts](https://fonts.google.com) for an alternative font if you need something fast.

### I have white borders on the bottom/sides of the print preview.

The Homebrewery paper size and your print paper size do not match.

The Homebrewery defaults to creating US Letter page sizes.  If you are printing with A4 size paper, you must add the "A4 Page Size" snippet.  In the "Print" dialog be sure your Paper Size matches the page size in Homebrewery.


### Typing `#### Adhesion` in the text editor doesn't show the header at all in the completed page?

Your ad-blocking software is mistakenly assuming your text to be an ad. We recommend whitelisting homebrewery.naturalcrit.com in your ad-blocking software, as we have no ads.

### My username appears as _hidden_ when checking my brews in the Vault, why is that?

Your username is most likely your e-mail adress, and our code is picking that up and protecting your identity. This will remain as is, but you can ask for a name change by contacting the moderators on [the subreddit](https://www.reddit.com/r/homebrewery) with your Homebrewery username, and your desired new name. You will also be asked to provide details about some of your unpublished brews, to verify your identity. No information will be leaked or shared.
