# How to Convert a GMBinder Document to Homebrewery
Here you will find a number of steps to guide you through converting a GMBinder document into a Homebrewery document.

**This document will evolve as users like yourself inform us of issues with it, or areas of conversion that it does not cover. _Please_ reach out if you have any suggestions for this document.**

The first thing you'll want to do is switch the editor's rendering engine from `Legacy` to `v3`. This will be the renderer we design features for moving forward.

### Simple Text Replacements
To make your life a little easier with this section, we recommend using a text editor like [VSCode](https://code.visualstudio.com/) or Notepad.

The following table describes GMBinder elements and their Homebrewery counterparts. A simple find/replace should get these in working order.

| GMBinder        | Homebrewery |
|:----------------|:---|
| `\pagebreak`    | `\page` |
| `======`        | `\page` |
| `\pagebreaknum` | `{{pageNumber,auto}}\n\page` |
| `@=====`        | `{{pageNumber,auto}}\n\page` |
| `\columnbreak`  | `\column` |
| `.phb`          | `.page` |

### Margins and Padding
Any manual margins and padding to push text down the page will likely need to be updated. Something to note is immediately after a column break

\page

## Stat Blocks

{{wide
There are pretty significant differences between stat blocks on GMBinder and Homebrewery. In this section we will describe a list of find/replace commands you can run against your GMB stat block to help make migrating them easier.
}}

### GMBinder Example:

```
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
```

\column

### Homebrewery example:

```
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
```

\page

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

\column

**Use these find/replace commands in the order listed for the best result.**

#### Blockquotes
The key difference is the lack of blockquotes. GMBinder uses the `>` symbol at the start of the line for each line in the stat block, and Homebrewery's v3 renderer does not. **You will want to remove all `>` characters at the beginning of all lines, and delete any leading spaces.**

#### Lists
The basic characteristics and advanced characteristics sections are not list elements in Homebrewery. **You will want to remove all `-` or `*` characters from the beginning of lines.**

#### Spacing
In order to have the correct spacing after removing the list elements, **you will want to add two colons (`::`) between the name of each basic/advanced characteristic and its value.** i.e:
```
**Skills** :: Athletics +6
```

:

Additionally, in the special traits and actions sections, you will want to add a colon at the beginning of each line that separates a trait/action from another, as seen below. **Any empty lines between special traits and actions should contain only a colon.**

```
### Actions
***Multiattack.*** The centaur makes two attacks: one with its pike and one with its hooves or two with its longbow.
:
***Pike.*** *Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 9 (1d10 + 4) piercing damage.
```

:

#### Final Notes
Lastly you will want to remove the leading `___` that started the stat block in GMBinder, and replace that with `{{monster` before the stat block, and `}}` after it. If you want a frame around the stat block, you can use `{{monster,frame` instead.


