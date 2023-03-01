const _ = require('lodash');
const dedent = require('dedent-tabs').default;


module.exports = ()=>{
	return dedent`{{backCover}}

![background image](https://i.imgur.com/Mqx8Vf7.png){right:-350px;}

# Back cover

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
:
Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
:
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
:
Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
__________

For use with the fifth edition manuals, existing and to exist.


{{logo 
Homebrewery.Naturlacrit.com
}}`;
};