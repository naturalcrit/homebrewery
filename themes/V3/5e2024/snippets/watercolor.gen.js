const _ = require('lodash');

module.exports = ()=>{
	return `{{watercolor${_.random(1, 12)},top:20px,left:30px,width:300px,background-color:#BBAD82,opacity:80%}}\n\n`;
};
