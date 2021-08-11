const _ = require('lodash');

const watercolorBG = [
	'https://i.imgur.com/UPUX4zG.png',
	'https://i.imgur.com/Q6Uquv9.png',
	'https://i.imgur.com/UOtaJpJ.png',
	'https://i.imgur.com/Wy2DVk3.png',
	'https://i.imgur.com/IempVlg.png',
	'https://i.imgur.com/iJ1ddgd.png',
	'https://i.imgur.com/qg4an04.png',
	'https://i.imgur.com/ogGTcCh.png',
	'https://i.imgur.com/itBD19A.png',
	'https://i.imgur.com/tbbycAt.png',
	'https://i.imgur.com/1SVWpGR.png',
	'https://i.imgur.com/wC1zkuJ.png'
];

module.exports = ()=>{
	return `\n![watercolor bg](${_.sample(watercolorBG)}) {watercolor,position:absolute,top:0px,left:0px,width:240px,filter:hue-rotate(0deg),mix-blend-mode:multiply,opacity:80%}\n`;
};