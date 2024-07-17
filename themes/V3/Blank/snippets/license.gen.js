/* eslint-disable max-lines */
const _ = require('lodash');

// Small and one-off licenses

module.exports = {

	mit : function () {
		return dedent`
		{{license,wide
		Copyright \\<YEAR\\> \\<COPYRIGHT HOLDER\\>
		:
		Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
		:
		The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
		:
		THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
		}}`;
	},
	orc1 : function () {
		return dedent`
        {{license,wide,orc
        | | |
        |-|-|
        |ORC Notice|This product is licensed under the ORC License located at the Library of Congress at TX 9-307-067 and available online at various locations including [possible domain names may be inserted] and others. All warranties are disclaimed as set forth therein.
        |Attribution|This product is based on the following Licensed Material:
        |^|[Title of Work], [Copyright Notice], [Author Credit Information].^|
        |^|[Title of Additional Work], [Copyright Notice], [Author Credit Information], [Etc.].^|
        |^|If you use our Licensed Material in your own published works, please credit us as follows:^|
        |^|[Title of This Work], [Copyright Notice], [Your Author Credit Information].^|
        |Reserved Material|Reserved Material elements in this product include, but may not be limited to: 
        |Expressly Designated Licensed|Material	The following elements are owned by the Licensor and would otherwise constitute Reserved Material and are hereby designated as Licensed Material:|
        }}
        `;
	},
	cczero        : `<i class="far fa-copyright"></i> \<year\> This work is openly licensed via [CC0](https://creativecommons.org/publicdomain/zero/1.0/)\n\n`,
	ccby          : `<i class="far fa-copyright"></i> \<year\> This work is openly licensed via [CC BY 4.0](https://creativecommons.org/publicdomain/by/4.0/)\n\n`,
	ccbysa        : `<i class="far fa-copyright"></i> \<year\> This work is openly licensed via [CC BY-SA 4.0](https://creativecommons.org/publicdomain/by-sa/4.0/)\n\n`,
	ccbync        : `<i class="far fa-copyright"></i> \<year\> This work is openly licensed via [CC BY-NC 4.0](https://creativecommons.org/publicdomain/by-nc/4.0/)\n\n`,
	ccbyncsa      : `<i class="far fa-copyright"></i> \<year\> This work is openly licensed via [CC BY-NC-SA](https://creativecommons.org/publicdomain/by-nc-sa/4.0/)\n\n`,
	ccbynd        : `<i class="far fa-copyright"></i> \<year\> This work is openly licensed via [CC BY-ND 4.0](https://creativecommons.org/publicdomain/by-nd/4.0/)\n\n`,
	ccbyncnd      : `<i class="far fa-copyright"></i> \<year\> This work is openly licensed via [CC NY-NC-ND 4.0](https://creativecommons.org/publicdomain/by-nc-nd/4.0/)\n\n`,
	cczeroBadge   : `![CC0](http://mirrors.creativecommons.org/presskit/buttons/88x31/svg/cc-zero.svg)`,
	ccbyBadge     : `![CC BY](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by.svg)`,
	ccbysaBadge   : `![CC BY-SA](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg)`,
	ccbyncBadge   : `![CC BY-NC](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc.svg)`,
	ccbyncsaBadge : `![CC BY-NC-SA](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-sa.svg)`,
	ccbyndBadge   : `![CC BY-ND](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nd.svg)`,
	ccbyncndBadge : `![CC BY-NC-ND](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-nd.svg)`,
	oseBlack      : `![Old School Essentials Black Logo](/assets/license_logos/Designed_For_Use_With_Old-School_Essentials_-_Black.png){width:200px}`,
	oseWhite      : `![Old School Essentials Black Logo](/assets/license_logos/Designed_For_Use_With_Old-School_Essentials_-_White.png){width:200px}`,
	oseNotice     : `Old-School Essentials is a trademark of Necrotic Gnome. The trademark and Old-School Essentials logo are used with permission of Necrotic Gnome, under license”.`,
};