const _ = require('lodash');
const dedent = require('dedent-tabs').default;

module.exports = {
	edge : ()=>{
		return dedent`
			{{imageMask${_.random(1, 8)},--offset:0cm,--rotation:0
			  ![](https://assets1.ignimgs.com/2019/05/29/dndmobile-br-1559158957902_160w.jpg?width=1280){height:100%}

			  <!-- Use offset to shift the edge up or down. Use rotation to set rotation angle in degrees. -->
			}}\n\n`;
	},

	corner : ()=>{
		return dedent`
			{{imageMask_Corner${_.random(1, 8)},--offset:0cm,bottom,left
			  ![](https://assets1.ignimgs.com/2019/05/29/dndmobile-br-1559158957902_160w.jpg?width=1280){height:100%}

			  <!-- Use offset to shift the edge up or down. Use top, bottom, left, and right to select a corner -->
			}}\n\n`;
	}

};

()=>{

};
