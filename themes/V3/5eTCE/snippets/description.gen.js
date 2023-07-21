const _ = require("lodash");

module.exports = () => {
return dedent`
{{description,imageMaskCenter${_.random(1, 16)},--offsetX:0%,--offsetY:0%,--rotation:0
The potion stash of a random witch, where we can see many magical brewings in their shelf.
}}
<!-- Use --offsetX to shift the mask left or right (can use cm instead of %)
     Use --offsetY to shift the mask up or down
     Use --rotation to set rotation angle in degrees. -->\n\n`};