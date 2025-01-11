```css
.page #example + table td {
	border:1px dashed #00000030;
}
.page {
	padding-bottom : 1.1cm;
}
```

# The Homebrewery *V3*
Welcome traveler from an antique land. Please sit and tell us of what you have seen. The unheard of monsters, who slither and bite. Tell us of the wondrous items and and artifacts you have found, their mysteries yet to be unlocked. Of the vexing vocations and surprising skills you have seen.

### Homebrew D&D made easy
The Homebrewery makes the creation and sharing of authentic looking Fifth-Edition homebrews easy. It uses [Markdown](https://help.github.com/articles/markdown-basics/) with a little CSS magic to make your brews come to life.

**Try it!** Simply edit the text on the left and watch it *update live* on the right. Note that not every button is visible on this demo page. Click New {{fas,fa-plus-square}} in the navbar above to start brewing with all the features!

### Editing and Sharing
When you create a new homebrew document ("brew"), your document will be given a *edit link* and a *share link*.

The *edit link* is where you write your brew. If you edit a brew while logged in, you are added as one of the brew's authors, and no one else can edit that brew until you add them as a new author via the {{fa,fa-info-circle}} **Properties** tab. Brews without any author can still be edited by anyone with the *edit link*, so be careful about who you share it with if you prefer to work without an account.

Anyone with the *share url* will be able to access a read-only version of your homebrew.

{{note
##### PDF Creation
PDF Printing works best in Google Chrome. If you are having quality/consistency issues, try using Chrome to print instead.

After clicking the "Print" item in the navbar a new page will open and a print dialog will pop-up.
* Set the **Destination** to "Save as PDF"
* Set **Paper Size** to "Letter"
* If you are printing on A4 paper, make sure to have the **PRINT → {{far,fa-file}} A4 Pagesize** snippet in your brew
* In **Options** make sure "Background Images" is selected.
* Hit print and enjoy! You're done!

If you want to save ink or have a monochrome printer, add the **PRINT → {{fas,fa-tint}} Ink Friendly** snippet to your brew!
}}

![homebrew mug](https://i.imgur.com/hMna6G0.png) {position:absolute,bottom:20px,left:130px,width:220px}

{{artist,bottom:160px,left:100px
##### Homebrew Mug
[naturalcrit](https://homebrew.naturalcrit.com)
}}

{{pageNumber 1}}
{{footnote PART 1 | FANCINESS}}

\column

## V3 vs Legacy
The Homebrewery has two renderers: Legacy and V3. The V3 renderer is recommended for all users because it is more powerful, more customizable, and continues to receive new feature updates while Legacy does not. However Legacy mode will remain available for older brews and veteran users.
	
At any time, any individual brew can be changed to your renderer of choice via the {{fa,fa-info-circle}} **Properties** tab on your brew. However, converting between Legacy and V3 may require heavily tweaking the document; while both renderers can use raw HTML, V3 prefers a streamlined curly bracket syntax that avoids the complex HTML structures required by Legacy.


Scroll down to the next page for a brief summary of the changes and features available in V3!
#### New Things All The Time!
Check out the latest updates in the full changelog [here](/changelog).

### Helping out
Like this tool? Head over to our [Patreon](https://www.patreon.com/Naturalcrit) to help us keep the servers running.


This tool will **always** be free, never have ads, and we will never offer any "premium" features or whatever.

### Bugs, Issues, Suggestions?
- Check the [Frequently Asked Questions](/faq) page first for quick answers.
- Get help or the right look for your brew by posting on [r/Homebrewery](https://www.reddit.com/r/homebrewery/submit?selftext=true&title=%5BIssue%5D%20Describe%20Your%20Issue%20Here) or joining the [Discord Of Many Things](https://discord.gg/by3deKx).
- Report technical issues or provide feedback on the [GitHub Repo](https://github.com/naturalcrit/homebrewery/).

### Legal Junk
The Homebrewery is licensed using the [MIT License](https://github.com/naturalcrit/homebrewery/blob/master/license). Which means you are free to use The Homebrewery codebase any way that you want, except for claiming that you made it yourself.

If you wish to sell or in some way gain profit for what's created on this site, it's your responsibility to ensure you have the proper licenses/rights for any images or resources used.
#### Crediting Us
If you'd like to credit us in your brew, we'd be flattered! Just reference that you made it with The Homebrewery.

### More Homebrew Resources
[![Discord](/assets/discordOfManyThings.svg){width:50px,float:right,padding-left:10px}](https://discord.gg/by3deKx)

If you are looking for more 5e Homebrew resources check out [r/UnearthedArcana](https://www.reddit.com/r/UnearthedArcana/) and their list of useful resources [here](https://www.reddit.com/r/UnearthedArcana/wiki/resources). The [Discord Of Many Things](https://discord.gg/by3deKx) is another great resource to connect with fellow homebrewers for help and feedback.


{{position:absolute;top:20px;right:20px;width:auto
[![Discord](/assets/discord.png){height:30px}](https://discord.gg/by3deKx)
[![Github](/assets/github.png){height:30px}](https://github.com/naturalcrit/homebrewery)
[![Patreon](/assets/patreon.png){height:30px}](https://patreon.com/NaturalCrit)
[![Reddit](/assets/reddit.png){height:30px}](https://www.reddit.com/r/homebrewery/)
}}

\page

## Markdown+
The Homebrewery aims to make homebrewing as simple as possible, providing a live editor with Markdown syntax that is more human-readable and faster to write with than raw HTML.

From version 3.0.0, with a goal of adding maximum flexibility without users resorting to complex HTML to accomplish simple tasks, Homebrewery provides an extended verision of Markdown with additional syntax.

### Curly Brackets
Standard Markdown lacks several equivalences to HTML. Hence, we have introduced `{{ }}` as a replacement for `<span></span>` and `<div></div>` for a cleaner custom formatting. Inline spans and block elements can be created and given ID's and Classes, as well as CSS properties, each of which are comma separated with no spaces. Use double quotes if a value requires spaces. Spans and Blocks start the same:

#### Span
My favorite author is {{pen,#author,color:orange,font-family:"trebuchet ms" Brandon Sanderson}}.  The orange text has a class of `pen`, an id of `author`, is colored orange, and given a new font. The first space outside of quotes marks the beginning of the content.


#### Block
{{purple,#book,text-align:center,background:#aa88aa55
My favorite book is Wheel of Time. This block has a class of `purple`, an id of `book`, and centered text with a colored background. The opening and closing brackets are on lines separate from the block contents.
}}

#### Injection
For any element not inside a span or block, you can *inject* attributes using the same syntax but with single brackets in a single line immediately after the element.

Inline elements like *italics* {color:#D35400} or images require the injection on the same line.

Block elements like headers require the injection to start on the line immediately following.

##### A Purple Header
{color:purple,text-align:center}

\* *this does not currently work for tables yet*

### Vertical Spacing
A blank line can be achieved with a run of one or more `:` alone on a line. More `:`'s will create more space.

::


Much nicer than `<br><br><br><br><br>`

### Definition Lists
**Example** :: V3 uses HTML *definition lists* to create "lists" with hanging indents.



### Column Breaks
Column and page breaks with `\column` and `\page`.

\column
### Tables
Tables now allow column & row spanning between cells. This is included in some updated snippets, but a simplified example is given below.

A cell can be spanned across columns by grouping multiple pipe `|` characters at the end of a cell.

Row spanning is achieved by adding a `^` at the end of a cell just before the `|`.  

These can be combined to span a cell across both columns and rows. Cells must have the same colspan if they are to be rowspan'd.

##### Example
| Head A | Spanned Header ||
| Head B | Head C | Head D |
|:-------|:------:|:------:|
| 1A     |    1B  |    1C  |
| 2A    ^|    2B  |    2C  |
| 3A    ^|    3B       3C ||
| 4A     |    4B       4C^||
| 5A    ^|    5B  |    5C  |
| 6A     |    6B ^|    6C  |

## Images
Images must be hosted online somewhere, like [Imgur](https://www.imgur.com). You use the address to that image to reference it in your brew\*.

Using *Curly Injection* you can assign an id, classes, or inline CSS properties to the Markdown image syntax.

![alt-text](https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg) {width:100px,border:"2px solid",border-radius:10px}

\* *When using Imgur-hosted images, use the "direct link", which can be found when you click into your image in the Imgur interface.*

## Snippets
Homebrewery comes with a series of *code snippets* found at the top of the editor pane that make it easy to create brews as quickly as possible.  Just set your cursor where you want the code to appear in the editor pane, choose a snippet, and make the adjustments you need.

## Style Editor Panel
{{fa,fa-paint-brush}} Usually overlooked or unused by some users, the **Style Editor** tab is located on the right side of the Snippet bar. This editor accepts CSS for styling without requiring `<style>` tags-- anything that would have gone inside style tags before can now be placed here, and snippets that insert CSS styles are now located on that tab.

{{pageNumber 2}}
{{footnote PART 2 | BORING STUFF}}
