import _ from 'lodash';
import dedent from 'dedent';
const domain = window.location.origin;

export default {
	center : ()=>{
		return dedent`
			{{imageMaskCenter${_.random(1, 16)},--offsetX:0%,--offsetY:0%,--rotation:0
			  ![The Roman Theater at Taormina, 1828, by Louise-Joséphine sarazin de Belmont](${domain}/assets/roman_theatre.webp){height:100%}
			}}
			<!-- Use --offsetX to shift the mask left or right (can use cm instead of %)
			     Use --offsetY to shift the mask up or down
			     Use --rotation to set rotation angle in degrees. -->\n\n`;
	},

	edge : (side = 'bottom')=>{
		const styles = ()=>{
			switch (side) {
				case 'bottom':
					return `{width:100%,bottom:0%}`
					break;
				case 'top':
					return `{width:100%,top:0%}`
					break;		
				default:
					return `{height:100%}`
					break;
			}
		}

		const rotation = {
			'bottom' : 0,
			'top'    : 180,
			'left'   : 90,
			'right'  : 270
		}[side];
		return dedent`
			{{imageMaskEdge${_.random(1, 8)},--offset:10%,--rotation:${rotation}
			  ![The Roman Theater at Taormina, 1828, by Louise-Joséphine sarazin de Belmont](${domain}/assets/roman_theatre.webp)${styles()}
			}}
			<!-- Use --offset to shift the mask away from page center (can use cm instead of %)
			     Use --rotation to set rotation angle in degrees. -->\n\n`;
	},

	corner : (y = 'top', x = 'left')=>{
		const offsetX = (x == 'left' ? '-50%' : '50%');
		const offsetY = (y == 'top'  ? '50%' : '-50%');
		return dedent`
			{{imageMaskCorner${_.random(1, 37)},--offsetX:${offsetX},--offsetY:${offsetY},--rotation:0
			  ![The Roman Theater at Taormina, 1828, by Louise-Joséphine sarazin de Belmont](${domain}/assets/roman_theatre.webp){height:100%}
			}}
			<!-- Use --offsetX to shift the mask left or right (can use cm instead of %)
			     Use --offsetY to shift the mask up or down
			     Use --rotation to set rotation angle in degrees. -->\n\n`;
	}

};

()=>{

};
