const _ = require('lodash');
const dedent = require('dedent-tabs').default;

module.exports = {
	edge : (side = 'bottom')=>{
		const rotation = {
			'bottom' : 0,
			'top'    : 180,
			'left'   : 90,
			'right'  : 270
		}[side];
		return dedent`
			{{imageMaskEdge${_.random(1, 8)},--offset:0cm,--rotation:${rotation};
			  ![](https://i.imgur.com/GZfjDWV.png){height:100%}
			}}
			<!-- Use --offset to shift the edge up or down from the page center.
			     Use --rotation to set rotation angle in degrees. -->\n\n`;
	},

	corner : (y = 'top', x = 'left')=>{
		const offsetX = (x == 'left' ? '-50%' : '50%');
		const offsetY = (y == 'top'  ? '-50%' : '50%');
		return dedent`
			{{imageMaskCorner${_.random(1, 37)},--offsetX:${offsetX},--offsetY:${offsetY},--rotation:0
			  ![](https://i.imgur.com/GZfjDWV.png){height:100%}
			}}
			<!-- Use --offsetX to shift the mask left or right (can use cm instead of %)
			     Use --offsetY to shift the mask up or down
			     Use --rotation to set rotation angle in degrees. -->\n\n`;
	}

};

()=>{

};
