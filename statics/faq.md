- Submitting work created on this site to DMs Guild


# I lost my brew?
- If you made any edits with an account, you can go to that account's page
- Homebrewery stores the last handful of brews you've viewed or edited under the recent brews tab
- Check your browser history for the edit link
- If all of that fails, find the share link, open the source and copy it into a new brew.


# Images
Image basics
- background images
- Adding brushes


How to make spacers


- How to skip page numbers
- How to set page number
- How to hide footers
#p1:before, #p1:after{ display:none }
#p2:before{ counter-reset: phb-page-numbers 30; }


- blockquotes, cite

styling images


# Print
- Saving ink
- Changing page size
- Printing to PDF



## Changing backgrounds
{{wide
In style
```
#p3{
	background-image : url('/assets/homebrewery/phb_style/img/dmg_bg.jpg')
}

```
}}

## Changes in v3

``` ``` -> \column


\page

## Columns
{{wide,twoColumn
This is how columns work sdfsdfsdf
```
{{twoColumn

| d4 | Manicurist Level | Equipment |
|:---:|:---:|:---|
| 1 | 1st | The four fragments of the Disk of Madness |
| 2 | 3rd | Broch of Air Blasts |
| 3 | 5th | The four fragments of the Disk of Madness |
| 4 | 7th | 3rd born child |


| d4 | Manicurist Level | Equipment |
|:---:|:---:|:---|
| 1 | 1st | The four fragments of the Disk of Madness |
| 2 | 3rd | Broch of Air Blasts |
| 3 | 5th | The four fragments of the Disk of Madness |
| 4 | 7th | 3rd born child |

}}

```

\column


{{twoColumn

| d4 | Manicurist Level | Equipment |
|:---:|:---:|:---|
| 1 | 1st | The four fragments of the Disk of Madness |
| 2 | 3rd | Broch of Air Blasts |
| 3 | 5th | The four fragments of the Disk of Madness |
| 4 | 7th | 3rd born child |


| d4 | Manicurist Level | Equipment |
|:---:|:---:|:---|
| 1 | 1st | The four fragments of the Disk of Madness |
| 2 | 3rd | Broch of Air Blasts |
| 3 | 5th | The four fragments of the Disk of Madness |
| 4 | 7th | 3rd born child |

}}

}}

this is after

