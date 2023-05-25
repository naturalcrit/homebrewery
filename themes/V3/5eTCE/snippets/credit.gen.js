const _ = require("lodash");

module.exports = () => {
  return `
{{credits}}

{{columns:2,gap:1cm

# Credits
**Lead Designers:**:: Dummy nº 1

**Art Director:**:: Dummy nº 2

:

**Design:**:: Dummy nº 3, Dummy nº 4, Dummy nº 5, Dummy nº 6

**Additional Design:**:: Dummy nº 7, Dummy nº 8, Dummy nº 9, Dummy nº 10, Dummy nº 11, Dummy nº 12, Dummy nº 13

**Rules Development:**:: Dummy nº 1, Dummy nº 3, Dummy nº 4, Dummy nº 6

**Editing:**:: Dummy nº 3, Dummy nº 4, Dummy nº 2, Dummy nº 7, Dummy nº 5

**Lead Graphic Designer:**:: Dummy nº 11

**Graphic Designers:**:: Dummy nº 23, Dummy nº 12

**Cover Illustrators:**:: Dummy nº 21, Dummy nº 22

**Interior Illustrators:**:: Dummy nº 13, Dummy nº 14, Dummy nº 15, Dummy nº 16, Dummy nº 17, Dummy nº 18, Dummy nº 19, Dummy nº 20, Dummy nº 11, Dummy nº 12, Dummy nº 24, Dummy nº 25

**Concept Illustrator:**:: Dummy nº 22

**Project Engineer:**:: Dummy nº 25

**Imaging Technicians:**:: Dummy nº 23

**Prepress Specialist:**:: Dummy nº 21
:
##### Random Game Studio

**Executive Producer:**:: Dummy nº 1

**Principal Designers:**:: Dummy nº 4, Dummy nº 5

**Design Manager:**:: Dummy nº 14

**Design Department:**:: Dummy nº 12, Dummy nº 20,
Dummy nº 21, Dummy nº 17 , Dummy nº 11

**Senior Art Director:**:: Dummy nº 18

**Art Department:**:: Dummy nº 21, EDummy nº 14, Dummy nº X,
Dummy nº Y

**Senior Producer:**:: Dummy nº 333

**Producers:**:: Dummy nº 14, Dummy nº 15

**Director of Product Management:**:: Dummy nº 26

**Licensing Manager:**:: Dummy nº 27

**Product Managers :**:: Dummy nº 28, Dummy nº 29, Dummy nº 27

**Brand Manager:**:: Dummy nº 30

**Publicity:**:: Dummy nº 31, Dummy nº 32

**Community Management:**:: Dummy nº 33

:

This book contains some content that originally appeared in _Random Book nº 1_ (2015), _Random Book nº 2_ (2018), _Random Book nº 3_ (2019), and _Random Book nº 4_ (2020).
}}
::
{{frame,height:5cm,width:8.5cm
![image](https://i.imgur.com/IwHRrbF.jpg){height:11cm,width:8.5cm,top:-70px}
}}

:

{{width:8cm
##### On the Cover
The adult red dragon Christopher looks down on a wizard, about to start a glorious meal.
}}

`;
};
