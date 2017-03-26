const _ = require('lodash');
const Data = require('./random.data.js');

const getFeature = (level)=>{
	let res = []
	if(_.includes([4,6,8,12,14,16,19], level+1)){
		res = ['Ability Score Improvement']
	}
	res = _.union(res, _.sampleSize(Data.abilities, _.sample([0,1,1,1,1,1])));
	if(!res.length) return '─';
	return res.join(', ');
};


module.exports = {

	casterTable : ()=>{

		let featureScore = 1
		const rows = _.map(Data.levels, (lvlText, level)=>{
			featureScore += _.random(0,1);
			return '| ' + [
				lvlText,
				'+'+Math.floor(level/4 + 2),
				getFeature(level),
				'+'+featureScore
			].join(' | ') + ' |';
		}).join('\n');

		return `{{frame,wide
##### ${Data.rand('classes')}
| Level | Proficiency Bonus | Features | Cantrips Known | Spells Known | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
${rows}
}}`;
	},


	halfcasterTable : ()=>{
		let featureScore = 1
		const rows = _.map(Data.levels, (lvlText, level)=>{
			featureScore += _.random(0,1);
			return '| ' + [
				lvlText,
				'+'+Math.floor(level/4 + 2),
				getFeature(level),
				'+'+featureScore
			].join(' | ') + ' |';
		}).join('\n');


		return `{{frame,wide
##### ${Data.rand('classes')}
| Level | Proficiency Bonus | Features | 1st | 2nd | 3rd | 4th | 5th |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|
${rows}
}}`;

	},

	noncasterTable : ()=>{
		let featureScore = 1
		const rows = _.map(Data.levels, (lvlText, level)=>{
			featureScore += _.random(0,1);
			return '| ' + [
				lvlText,
				'+'+Math.floor(level/4 + 2),
				getFeature(level),
				'+'+featureScore
			].join(' | ') + ' |';
		}).join('\n');

		return `{{frame
##### ${Data.rand('classes')}
| Level | Proficiency Bonus | Features | ${Data.rand('abilities')} |
|:---:|:---:|:---|:---:|
${rows}
}}`;
	}


}