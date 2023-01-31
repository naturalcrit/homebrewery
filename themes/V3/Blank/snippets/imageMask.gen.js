const _ = require('lodash');
const dedent = require('dedent-tabs').default;

module.exports = {
	edge : ()=>{
		return dedent`
			{{imageMaskEdge${_.random(1, 8)},--offset:0cm,--rotation:0
			  ![](https://i.imgur.com/GZfjDWV.png){height:100%}
			}}
			<!-- Use --offset to shift the edge up or down from the page center.
			     Use --rotation to set rotation angle in degrees. -->\n\n`;
	},

	corner : ()=>{
		return dedent`
			{{imageMaskCorner${_.random(1, 8)},--offset:0cm,bottom,left
			  ![](https://i.imgur.com/1w5khYt.png){height:100%}
			}}
			<!-- Use offset to shift the edge up or down.
			     Use top, bottom, left, and right to select a corner -->\n\n`;
	}

};

()=>{

};
