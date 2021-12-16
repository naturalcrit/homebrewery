# How to Convert a Legacy Document to v3
Here you will find a number of steps to guide you through converting a Legacy document into a Homebrewery v3 document.

**The first thing you'll want to do is switch the editor's rendering engine from `Legacy` to `v3`.** This will be the renderer we design features for moving forward.

There are some examples of Legacy code in the code pane if you need more context behind some of the changes.

**This document will evolve as users like yourself inform us of issues with it, or areas of conversion that it does not cover. _Please_ reach out if you have any suggestions for this document.**

## Simple Replacements
To make your life a little easier with this section, a text editor like [VSCode](https://code.visualstudio.com/) or Notepad will help a lot.

The following table describes Legacy and other document elements and their Homebrewery counterparts. A simple find/replace should get these in working order.

| Legacy / Other  | Homebrewery                  |
|:----------------|:-----------------------------|
| `\pagebreak`    | `\page`                      |
| `======`        | `\page`                      |
| `\pagebreaknum` | `{{pageNumber,auto}}\n\page` |
| `@=====`        | `{{pageNumber,auto}}\n\page` |
| `\columnbreak`  | `\column`                    |
| `.phb`          | `.page`                      |

## Classed or Styled Divs
Anything that relies on the following syntax can be changed to the new Homebrewery v3 curly brace syntax:

```
<div class="classTable wide">
...
</div>
```
:
The above example is equivalent to the following in v3 syntax.

```
{{classTable,wide
...
}}
```
:
Some examples of this include class tables (as shown above), descriptive blocks, notes, and spell lists.

\column

## Margins and Padding
Any manual margins and padding to push text down the page will likely need to be updated. Colons can be used on lines by themselves to push things down the page vertically if you'd rather not set pixel-perfect margins or padding.

## Notes

In Legacy, notes are denoted using markdown blockquote syntax. In Homebrewery v3, this is replaced by the curly brace syntax.

<!--
> ##### Catchy Title
> Useful Information
-->

{{note
##### Title
Information
}}

## Split Tables
Split tables also use the curly brace syntax, as the new renderer can handle style values separately from class names.

<!--
<div style='column-count:2'>

| d8  | Loot |
|:---:|:-----------:|
|  1  | 100gp |
|  2  | 200gp |
|  3  | 300gp |
|  4  | 400gp |

| d8  | Loot |
|:---:|:-----------:|
|  5  | 500gp |
|  6  | 600gp |
|  7  | 700gp |
|  8  | 1000gp |

</div>
-->

##### Typical Difficulty Classes
{{column-count:2
| Task Difficulty | DC |
|:----------------|:--:|
| Very easy       | 5  |
| Easy            | 10 |
| Medium          | 15 |

| Task Difficulty   | DC |
|:------------------|:--:|
| Hard              | 20 |
| Very hard         | 25 |
| Nearly impossible | 30 |
}}

## Blockquotes
Blockquotes are denoted by the `>` character at the beginning of the line. In Homebrewery's v3 renderer, they hold virtually no meaning and have no CSS styling. You are free to use blockquotes when styling your document or creating themes without needing to worry about your CSS affecting other parts of the document.

{{pageNumber,auto}}

\page

## Stat Blocks

There are pretty significant differences between stat blocks on the Legacy renderer and Homebrewery v3. This section contains a list of changes that will need to be made to update the stat block.

### Initial Changes
You will want to **remove all leading** `___` that started the stat block in Legacy, and replace that with `{{monster` before the stat block, and `}}` after it.

**If you want a frame** around the stat block, you can add `,frame` to the curly brace definition.

**If the stat block was wide**, make sure to add `,wide` to the curly brace definition.

### Blockquotes
The key difference is the lack of blockquotes. Legacy documents use the `>` symbol at the start of the line for each line in the stat block, and the v3 renderer does not. **You will want to remove all `>` characters at the beginning of all lines, and delete any leading spaces.**

### Lists
The basic characteristics and advanced characteristics sections are not list elements in Homebrewery. You will want to **remove all `-` or `*` characters from the beginning of lines.**

### Spacing
In order to have the correct spacing after removing the list elements, you will want to **add two colons between the name of each basic/advanced characteristic and its value.** _(see example in the code pane)_

Additionally, in the special traits and actions sections, you will want to add a colon at the beginning of each line that separates a trait/action from another, as seen below. **Any empty lines between special traits and actions should contain only a colon.** _(see example in the code pane)_

\column

{{margin-top:102px}}

<!--
### Legacy/Other Document Example:
___
> ## Centaur
> *Large Monstrosity, neutral good*
>___
> - **Armor Class** 12
> - **Hit Points** 45(6d10 + 12)
> - **Speed** 50ft.
>___
>|STR|DEX|CON|INT|WIS|CHA|
>|:---:|:---:|:---:|:---:|:---:|:---:|
>|18 (+4)|14 (+2)|14 (+2)|9 (-1)|13 (+1)|11 (+0)|
>___
> - **Skills** Athletics +6, Perception +3, Survival +3
> - **Senses** passive Perception 13
> - **Languages** Elvish, Sylvan
> - **Challenge** 2 (450 XP)
> ___
> ***Charge.*** If the centaur moves at least 30 feet straight toward a target and then hits it with a pike attack on the same turn, the target takes an extra 10 (3d6) piercing damage.
>
> ***Second Thing*** More details.
>
> ### Actions
> ***Multiattack.*** The centaur makes two attacks: one with its pike and one with its hooves or two with its longbow.
>
> ***Pike.*** *Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 9 (1d10 + 4) piercing damage.
>
> ***Hooves.*** *Melee Weapon Attack:* +6 to hit, reach 5 ft., one target. *Hit:* 11 (2d6 + 4) bludgeoning damage.
>
> ***Longbow.*** *Ranged Weapon Attack:* +4 to hit, range 150/600 ft., one target. *Hit:* 6 (1d8 + 2) piercing damage.
-->

### Homebrewery v3 Example:

{{monster
## Centaur
*Large monstrosity, neutral good*
___
**Armor Class** :: 12
**Hit Points**  :: 45(6d10 + 12)
**Speed**       :: 50ft.
___
|  STR  |  DEX  |  CON  |  INT  |  WIS  |  CHA  |
|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
|18 (+4)|14 (+2)|14 (+2)|9 (-1) |13 (+1)|11 (+0)|
___
**Skills** :: Athletics +6, Perception +3, Survival +3
**Senses** :: passive Perception 13
**Languages** :: Elvish, Sylvan
**Challenge** :: 2 (450 XP)
___
***Charge.*** If the centaur moves at least 30 feet straight toward a target and then hits it with a pike attack on the same turn, the target takes an extra 10 (3d6) piercing damage.
:
***Second Thing*** More details.

### Actions
***Multiattack.*** The centaur makes two attacks: one with its pike and one with its hooves or two with its longbow.
:
***Pike.*** *Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 9 (1d10 + 4) piercing damage.
:
***Hooves.*** *Melee Weapon Attack:* +6 to hit, reach 5 ft., one target. *Hit:* 11 (2d6 + 4) bludgeoning damage.
:
***Longbow.*** *Ranged Weapon Attack:* +4 to hit, range 150/600 ft., one target. *Hit:* 6 (1d8 + 2) piercing damage.
}}

{{pageNumber,auto}}



