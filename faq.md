# FAQ

**Last Edit:** 26.11.2020

## Website Issues
**Q:** The site is down for me! Anyone else?  
**A:** You can check https://downforeveryoneorjustme.com/homebrewery.naturalcrit.com to see if the homebrewery is up.

**Q:** How do I log out?  
**A:** Go to http://www.naturalcrit.com/login, there you can click "logout".

**Q:** Is there a way to reset or restore my password?  
**A:** Currently no. This is, however, a feature that is being worked on. No ETA right now.

**Q:** I can't access my profile page, what gives?  
**A:** Most likely you used your e-mail address as your username, which is currently not supported. Please create a new account, avoiding special characters (like @, #, or the like).

**Q:** The preview window is suddenly gone, I can only see the editor side of the homebrewery (or the other way around)  
**A:** Press CTRL+SHIFT+i (or right-click and select "Inspect") while in the homebrewery. 

Expand `body` -> `main` -> `div class="homebrew"` -> `div class="editPage page"` -> `div class="content"` -> `div class="splitPane"`.

There you will find 3 divs: `<div class="pane" [...]>`, `<div class="divider" [...]>`, and `<div class="pane" [...]>`. The first (or second, depending on which side of the homebrewery went missing) `<div class="pane">` has a style tag, that looks similar to this: `<div class="pane" data-reactid="36" style="flex: 0 0 auto; width: 925px;">`.

Change whatever stands behind `width:` to something smaller than your display width. Here's a screenshot of how it looks expanded: [imgur](https://i.imgur.com/QdqPNIg.png).

**Q:** I worked on a brew for $x hours, and when I returned the next day, all changes were gone?  
**A:** This happens when you did not close the tab but closed the browser, or used the back button of your browser to return to your brew! If you return to your brew under these circumstances, the version of your brew you saved before is still loaded in the cache, so you need to refresh or reopen the page for your recent changes to be in said cache. If you start working on your brew without refreshing, all changes you made in the meantime are gone. Additionally, pay extra attention to the next question below!

**Q:** Is there a way to restore a previous version of my brew?  
**A:** Currently, no. This would take too much of a toll on the amount of storage the homebrewery requires. This may be solved in the future.

**Q:** The code and/or preview window of my brew are just blue, nothing else. Also, the version in the top displays 0.0.0.  
**A:** You have an error in the HTML you used in your brew. That's why the page can't render properly anymore. Click the Share button in the top right, then click the Source button in the top right, get your brew's code, create a new brew, paste the code in there, fix the HTML error, and you're done. At this point, you can also delete the old brew, it is not fixable.

**Q:** I have important brews, but I can't access them anymore because [...]  
**A:** Most important thing to remember: Save early, save often. Also, check out the "Back Up Your Stuff!" section below for more information.

## Text Issues
**Q:** How do I resize text globally/locally?  
**A:** [Globally](https://old.reddit.com/r/homebrewery/comments/8bivc7/question_how_do_i_resize_text_globally/dx8et7c/) | 
[Locally](https://old.reddit.com/r/homebrewery/comments/9pvj0q/font_size_change/)  

**Q:** How do I use different fonts in my brews?  
**A:** The best way, I would say, is to transform the font you want to use into the base64 format, using a website such as [fontsquirrel.com](https://www.fontsquirrel.com/tools/webfont-generator). Once there, click "Expert..." and go all the way down to "CSS" and mark "Base64 encode" and "Yes, the fonts I'm uploading are legally eligible for web embedding." (make sure that they, infact, are!). Go back to the top and click "Upload font". Select the font file you want to use. Once the font is transformed, click "Download your kit" at the bottom. In the resulting .zip file, you will find a file named "stylesheet.css". Open it and copy all of its contents.

Go to your homebrew and either add the copied information to your `<style>` section, or create a new section via `<style></style>` and paste the copied information there. You can then use `font-family: fontname`, where *fontname* is the part after `font-family: ` in the `@font-face` segment, to add that font to your brew.

***Example:*** You want to have a different font for all elements with the `testFontClass` class. This is how you would go about that:

1. Upload your font to [fontsquirrel.com](https://www.fontsquirrel.com/tools/webfont-generator) and have it base64 encoded. 

2. In the resulting .zip file, look for the .css file, open it, and copy its contents, which will look something like this (Your `url()` parts  will be much longer, I removed most of it for the sake of readability):

        @font-face {
            font-family: 'testFont';
            src: url(data:application/font-woff2;charset=utf-8;base64,d09GMgABAA[...]+wEAAA=) format('woff2'),
                url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAHTcABI[...]+wAAAADYwmAT) format('woff');
            font-weight: normal;
            font-style: normal;
        }

3. In your homebrew, either add a `<style></style>` section at the top or, if you already have one, add the copied `@font-face{ [...] }` to it. 

4. In that same `<style>` section, add a new class that uses the new font:

        .phb .testFontClass {
            font-family: testFont;
        }

5. Now everytime you do something like `<p class="testFontClass">This is in a different font.</p>`, your newly added font will be used.

If you think that the base64 encoded font takes up a bit too much space in your brew, see the question below.

**Q:** I heavily customized the style of my brews, and I have a lot of brews in which I want to use my custom style, without having to copy it over everytime I change a little detail about it.  
**A:** Create a new file on your computer, and name it something like `MyHomebrewStyle.css`. Put all the style information you use into this file (do not add the `<style></style>` tags to this file!). Upload said file to a place that is accessible to the homebrewery. Go to your brew, remove everything within your `<style></style>` tags, and add this: `@import "https://my.website.com/MyHomebrewStyle.css";` 

Be aware that, should you change something in that css file, your homebrew will have to be reloaded for these changes to take effect.

**Q:** How do I use different colors in my brews?  
**A:** [Described here](https://old.reddit.com/r/homebrewery/comments/9kesk1/changing_text_colour_to_white/)

**Q:** How do I get a line break without indentation?  
**A:** [Described here](https://old.reddit.com/r/homebrewery/comments/8hmr50/getting_line_breaks_without_getting_a_new/)  

**Q:** How do I fix line indentations in monster statblocks?  
**A:** [Described here](https://old.reddit.com/r/homebrewery/comments/ag46i1/indentation_problem/)

**Q:** When I write more text than fits into the two columns on the page, the text overflows into a third column and goes off-page. Why isn't a new page generated for the text?  
**A:** Auto-generating a new page via code lies between tricky and impossible. Use `\page` to create a new page manually. If you have an idea about how to implement auto-new-page-ing, head over to [GitHub](https://github.com/naturalcrit/homebrewery) and let us know.

**Q:** Typing `#### Adhesion` in the formatting doesn't show the titling at all in the completed page?  
**A:** Whitelist homebrewery.naturalcrit.com in your ad-blocking software.

## Paper Size
**Q:** I have white borders on the bottom/sides of the print preview.  
**A:** The homebrewery paper size and your print paper size do not match. 

The default homebrewery paper size is “Letter.”

If you are in the US (and you did not add the A4 snippet), in the "Print to PDF" window, click "More settings" and change "Paper size" to "Letter".

If you are anywhere else, your default "Paper size" setting is most likely "A4" and you need to change it to "Letter" (as described above). You can also add the A4 snippet to the top of your brew to make it A4-sized.

## Get PDF
**Q:** Whenever I click on the "Get PDF" button, instead of getting a download, it opens Print Preview in another tab.  
**A:** Yes, this is by design. In the print preview, select "Save as PDF" as the Destination, and then click "Save". There will be a normal download dialog where you can save your brew as a PDF.

---

# PSAs

## Back Up Your Stuff!

By that I mean, when you brew, occasionally hit CTRL + A, CTRL + C, open a texteditor (on your local machine), CTRL + V your brew in there, and save that file.

You can go as crazy as you want to be with that. Create one file per brew, that's fine. Create one file per brew per day you edit it, that's even better. Create one file per brew per day you edit it, save it in two or more separate (remote) locations? That's even more better (I do it that way ;) ). 

Whatever method you prefer, just do it. 

Also, see the "Backing Up Brews with a Bookmarklet", "Backing Up Brews with Linux" section, and the comments below.

## Brewmasters


We recently started the "Brewmasters" program, where we give out a special flair to users that have proven that they know what they are talking about when it comes to using the [Homebrewery](https://homebrewery.naturalcrit.com). 

The first member to earn this special flair is u/VexbaneAramori, who is a pillar of this community. 

Brewmasters can nominate other active users to become Brewmasters via ModMail as well. 

Thanks to all who help to make this community more helpful and welcoming. :)

**18.05.2020 - Update:** We're happy to announce that u/Jintonix has joined the ranks of our Brewmasters. Welcome!

---

# Miscellaneous

## Backing Up Brews with a Bookmarklet

This solution was provided by u/garumoo in the [comments](https://www.reddit.com/r/homebrewery/comments/adh6lh/faqs_psas_announcements/edrvz8o/) of the old [PSA](https://www.reddit.com/r/homebrewery/comments/adh6lh/faqs_psas_announcements/). 

> Here is a handy bookmarklet for saving your brew
> 
> Just create a new bookmark, put it onto your browser button bar, and edit it, changing the URL to:

    javascript:(function() {var nav=document.getElementsByClassName('navContent')[0];var share=nav.querySelector('.navItem[icon="fa-share-alt"');var code=nav.querySelector('.navItem[icon="fa-code"');if(share||code){let brewtitle=document.getElementsByClassName('brewTitle')[0].innerText;let date=new Date();let dd=date.getDate();let mm=date.getMonth()+1;let yyyy=date.getFullYear();let hour=date.getHours();let mins=date.getMinutes();dd=dd<10?'0'+dd:dd;mm=mm<10?'0'+mm:mm;hour=hour<10?'0'+hour:hour;mins=mins<10?'0'+mins:mins;let dateString=`${yyyy}-${mm}-${dd}-${hour}${mins}`;let filename=brewtitle+'-'+dateString+'.md';var sourceuri=share?share.href.replace('share','source'):code.href;fetch(sourceuri).then((response)=>{if(response.ok){return response.text()}}).then((payload)=>{var div=document.createElement('div');div.innerHTML=payload;var brewtext=div.innerText;delete div;let data_uri='data:text/markdown; charset=UTF-8,'+encodeURIComponent(brewtext);var link=document.createElement("a");link.download=filename;link.href=data_uri;document.body.appendChild(link);link.click();document.body.removeChild(link);delete link})}})();

> Then, while viewing either the edit or the share versions, just click the bookmarklet. It should then download as a text file named as Brewtitle-yyyy-mm-dd-hhmm.md
> 
> The code doesn't sanitise the brewtitle so if you have a funky brewtitle and things blow up that's on you.

## Backing Up Brews with Linux

This following script was written by myself, u/Thurse. For an easier to use script, check out u/-Hydrargyros-'s [comment](https://www.reddit.com/r/homebrewery/comments/adh6lh/faqs_psas_announcements/ee9xtsw/) on the old [PSA](https://www.reddit.com/r/homebrewery/comments/adh6lh/faqs_psas_announcements/).

Hello everyone,  
as of now, I'm pretty sure everyone has read our [PSA on Backing Up Your Stuff](https://old.reddit.com/r/homebrewery/comments/a0ubx1/psa_back_up_your_stuff/), as you should... :)

In the PSA thread, u/sonaplayer offered a way to automatically back up your stuff via Google Docs. Although a good method, it can't handle larger brews, so it wasn't for me. I actually corresponded with u/sonaplayer on the topic, and said at one point "maybe someday I will write something in bash...". Well, "someday" was during the christmas holidays, so I present to you:

A bash script to backup your brews!

### How does this work?

1. Go to https://pastebin.com/hkx0NXid and click "download".  
1a. You can actually look at the source code there to see how it works.  
2. Save the file as `backupBrews.sh` (this should be the default name already).  
2a. If it isn't already on a Linux system, transfer the file to one. Or use "[git bash for Windows](https://gitforwindows.org/)" or whatever tickles your fancy.  
3. Make sure you put it to a place where you have sufficient permissions to read, write, and create folders.  
4. The script should run on any Linux, I tested it on Raspbian and with "git bash for Windows".  
5. The simplest way to use this is `./backupBrews.sh -b BrewId` where the `BrewId` is the last part of the SHARE link: https://homebrewery.naturalcrit.com/share/*HereIsTheBrewId*. You don't need the whole link, just the `BrewId` part! Also, don't use the EDIT id, because that won't work.  
5a. There will be several checks, if they pass, your brew will be downloaded and "cleaned up". What does that mean? When you get the source of your brew, all the `<` will be replaced with `&lt;` and all the `>` will be replaced with `&gt;`. The clean up process turns all the `&lt;` and `&gt;` back into `<` and `>`, so that you can theoretically take the text from the .md file and paste it into the homebrewery, ready to go. **Be aware:** Clean up can take quite a while. My Raspberry Pi 3 B+ needs about 10 minutes to clean up my largest brew at ~1,000,000 characters.    
5b. A folder will be created in the current location of the script, named as follows: `./backup/BrewId/`  
5c. Inside that folder, a file named BrewId_YYYYMMDD_HHMMSS.md will be created.  
6. That's it. For advanced usage, see `--help` or the info below.

### Advanced Usage

Apparently, you are not content with the tool's basic function. That's cool, I wasn't either. :) 

There are some more options you can use, described in detail below.

&nbsp;

#### Mandatory Options

* `-b BrewId`

At least one `-b BrewId` is mandatory, else the program will exit. You can do however many brews at once as you like. Just make sure to use `-b BrewId`, and all's good.

***Example.*** `./backupBrews.sh -b BrewId1 -b BrewId2 -b BrewId3`

Instead of using the BrewId as the name for the folder and the file, you can give your brew a (short) name. You should avoid spaces and special characters. If you must, you can use quotes to have spaces in the name. BrewName and BrewId have to be separated via `::`.

***Example.*** `./backupBrews.sh -b BrewName1::BrewId1`

You can of course combine these options:

***Example.*** `./backupBrews.sh -b BrewName1::BrewId1 -b BrewId2 -b "Dont use spaces"::BrewId3`

&nbsp;

#### Optional options

* `--help`

Show the help. This is the only option you can use without the `-b` option.

&nbsp;

* `-s`

The tool is verbose by default. The `-s` option turns off all output. You are still able to get an exit status via `echo $?`.

***Example.*** `./backupBrews.sh -s -b BrewId`

&nbsp;

* `-d dateformat`

This changes the date format at the end of the backup file. Standard is `%Y%m%d_%H%M%S`. You can enter whatever is accepted by `date`. See `date --help` for more information. The example below gives you the current unix timestamp, so your filename would look something like this: `BrewId_1546297200.md`

***Example.*** `./backupBrews.sh -d %s -b BrewId`

&nbsp;

* `-l location`

This changes the savelocation of your backups. The example below puts the brew folders into a folder called "backup" in the home of the current user, like so: `~/backup/BrewId/BrewId_20190101_000000.md`. Be aware that this script will only create a folder for the brew, not folders above that. To use the example, if the folder `~/backup/` doesn't exist, this tool will not create that folder and simply exit.

***Example.*** `./backupBrews.sh -l "~/backup/" -b BrewId`

&nbsp;

You can of course combine all of the options mentioned above:

***Example.*** `./backupBrews.sh -s -d %s -l "~/backup/" -b BrewName1::BrewId1 -b BrewId2 -b "Dont use spaces"::BrewId3`

---

If you have any questions, feel free to ask.