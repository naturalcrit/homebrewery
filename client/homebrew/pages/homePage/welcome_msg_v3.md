```css
.page #example + table td {
	border:1px dashed #00000030;
}


```

# The Homebrewery *V3*
Welcome traveler from an antique land. Please sit and tell us of what you have seen. The unheard of monsters, who slither and bite. Tell us of the wondrous items and and artifacts you have found, their mysteries yet to be unlocked. Of the vexing vocations and surprising skills you have seen.

### Homebrew D&D made easy
The Homebrewery makes the creation and sharing of authentic looking Fifth-Edition homebrews easy. It uses [Markdown](https://help.github.com/articles/markdown-basics/) with a little CSS magic to make your brews come to life.

**Try it!** Simply edit the text on the left and watch it *update live* on the right.

### Editing and Sharing
When you create your own homebrew, you will be given a *edit url* and a *share url*.

Any changes you make while on the *edit url* will be automatically saved to the database within a few seconds. Anyone with the edit url will be able to make edits to your homebrew, so be careful about who you share it with.

Anyone with the *share url* will be able to access a read-only version of your homebrew.

### PDF Creation
PDF Printing works best in Google Chrome. If you are having quality/consistency issues, try using Chrome to print instead.

After clicking the "Print" item in the navbar a new page will open and a print dialog will pop-up.
* Set the **Destination** to "Save as PDF"
* Set **Paper Size** to "Letter"
* If you are printing on A4 paper, make sure to have the "A4 page size snippet" in your brew
* In **Options** make sure "Background Images" is selected.
* Hit print and enjoy! You're done!

If you want to save ink or have a monochrome printer, add the **Ink Friendly** snippet to your brew before you print



\column

## New in V3.0.0
With the latest major update to *The Homebrewery* we've implemented an extended Markdown-like syntax for block and span elements, plus a few other changes, eliminating the need for HTML tags like `div` and `span` in most cases. No raw HTML tags should be needed in a brew, and going forward, raw HTML will no longer receive debugging support (*but can still be used if you insist*).

All brews made prior to the release of v3.0.0 will still render normally, and you may switch between the "legacy" brew renderer and the newer "V3" renderer via the {{fa,fa-info-circle}} **Properties** button  on your brew. Much of the syntax and styling has changed in V3, so code in one version may be broken in the other.

Scroll down to the next page for a brief summary of the changes and new features available in V3!

#### New Things All The Time!
What's new in the latest update? Check out the full changelog [here](/changelog).

### Helping out
Like this tool? Want to buy me a beer? [Head here](https://www.patreon.com/Naturalcrit) to help me keep the servers running.

This tool will **always** be free, never have ads, and I will never offer any "premium" features or whatever.

### Bugs, Issues, Suggestions?
Need help getting started or just the right look for your brew? Head to [r/Homebrewery](https://www.reddit.com/r/homebrewery/submit?selftext=true&title=%5BIssue%5D%20Describe%20Your%20Issue%20Here) and let us know!

Have an idea of how to make The Homebrewery better? Or did you find something that wasn't quite right? Check out the [GitHub Repo](https://github.com/naturalcrit/homebrewery/) to report technical issues.



### Legal Junk
The Homebrewery is licensed using the [MIT License](https://github.com/naturalcrit/homebrewery/blob/master/license). Which means you are free to use The Homebrewery any way that you want, except for claiming that you made it yourself.

If you wish to sell or in some way gain profit for what's created on this site, it's your responsibility to ensure you have the proper licenses/rights for any images or resources used.

#### Crediting Me
If you'd like to credit The Homebrewery in your brew, I'd be flattered! Just reference that you made it with The Homebrewery.

### More Resources
If you are looking for more 5e Homebrew resources check out [r/UnearthedArcana](https://www.reddit.com/r/UnearthedArcana/) and their list of useful resources [here](https://www.reddit.com/r/UnearthedArcana/comments/3uwxx9/resources_open_to_the_community/).



<img src='https://i.imgur.com/hMna6G0.png' style='position:absolute;bottom:50px;left:120px;width:180px' />

<div class='pageNumber'>1</div>
<div class='footnote'>PART 1 | FANCINESS</div>




\page

## Markdown+
Homebrewery aims to make homebrewering as simple as possible, providing a live editor in combination with Markdown syntax for formatting.  

In version 3.0.0, with a goal of retaining maximum flexibility while elmininating the need for any HTML in a brew, Homebrewery has developed additional Markdown-like syntax.

{{text-align:center
**You must enable v3 via the metadata editor!**
}}


### Curly Brackets
The biggest change in version 3 is the replacement of `<span></span>` and `<div></div>` with `{{ }}`.  Inline spans and block elements can be created and given ID's and Classes, as well as css properties, each of which are comma separated with no spaces.  Spans and Blocks start the same:

#### Span
My favorite author is {{pen,#author,color:orange,font-family:"trebuchet ms" Brandon Sanderson}}.  The orange text is given a class of `pen`, and id of `author`, colored orange, and given a new font.


#### Block
{{purple,#book,background:#aa88aa55,text-align:center
My favorite book is Wheel of Time.  This block has a class of `purple`, an id of `book`, and has been styled with a purple background and centered text.
}}


#### Injection
For any element that is not inside a span or block, you can *inject* attributes using the same syntax but with single brackets immediately after the element.  Below, a width and border are set for an image:

![alt-text](https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg) {width:100px,border:"2px solid",border-radius:10px}

\* *this does not currently work for tables yet*

### Vertical Spacing
The HTML tag `<br>` has been replaced by either a single `:` along on a line, or multiple `:` on the same line.

::

Much nicer than `<br><br><br><br><br>`

### Definition Lists
V3 uses HTML *definition lists* to create "lists" with hanging indents.


**Condition Immunities** :: Here is some text that is long and overflows into a second line, creating a "hanging indent".
**Senses**               :: Here is some text that is long and overflows into a second line, creating a "hanging indent".



\column

### Tables
New in v3.0.0 is the option  to add column & row spanning between cells.  You can see a working example in the updated Class Table Snippet, but a simplified example is given below.

A cell can be spanned across columns by bunching pipe `|` characters together.

Row spanning is achieved by adding a `^` at the end of a cell just before the `|`.  

These can be combined to span a cell across both columns and rows. Cells must have the same colspan if they are to be rowspan'd.

##### Example
|        | Spanned Header ||
| Head A | Head B | Head C |
|:-------|:-------|:-------|
| 1A     |    1B  |    1C  |
| 2A    ^|    2B  |    2C  |
| 3A    ^|    3B       3C ||
| 4A     |    4B       4C^||
| 5A    ^|    5B  |    5C  |
| 6A     |    6B ^|    6C  |


## Images
Images must be hosted online somewhere, like [Imgur](https://www.imgur.com). You use the address to that image to reference it in your brew\*. Images can be included using Markdown-style images.

Using *Curly Injection* you can assign an id, classes, or specific inline CSS properties to the image.

:::

\* *When using Imgur-hosted images, use the "direct link", which can be found when you click into your image in the Imgur interace.*

## Snippets
Homebrewery comes with a series of *code snippets* found at the top of the editor pane that make it easy to create brews as quickly as possible.  Just set your cursor where you want the code to appear in the editor pane, choose a snippet, and make the adjustments you need.


## Style Editor Panel

{{fa,fa-paint-brush}}Also, technically released prior to v3 but still new to many users, check out the new **Style Editor** located on the right side of the Snippet bar.  This editor excepts CSS for styling without requiring `<style>` tags-- anything that would have gone inside style tags before can now be placed here.



<div class='pageNumber'>2</div>
<div class='footnote'>PART 2 | BORING STUFF</div>
