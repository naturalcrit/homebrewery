const _ = require('lodash');
const BrewData = require('../server/brew.data.js');

let PopulatedBrews = {};

module.exports = {
	random : (num = 20)=>{
		return _.times(num, ()=>{
			//TODO: Build better generator
			return {
				title : 'BrewA',
				description : '',
				text : '',
				authors : _.sampleSize(['userA','userB','userC','userD'], _.random(0, 3)),
				systems : _.sampleSize(['5e', '4e', '3.5e', 'Pathfinder'], _.random(0,2)),
				views   : _.random(0,1000),
				published : !!_.random(0,1)
			};
		});
	},
	static : () => {
		return {
			BrewA : {
				title : 'Brew-Alpha',
				description : 'fancy',
				authors : ['userA'],
				systems : [],
				views   : 12,
				published : false
			},
			BrewB : {
				title : 'Brew-Beta',
				description : 'very fancy',
				authors : ['userA'],
				systems : [],
				views   : 7,
				published : true
			},
			BrewC : {
				title : 'Brew-Charlie',
				description : 'test',
				authors : ['userA', 'userB'],
				systems : [],
				views   : 0,
				published : false
			},
			BrewD : {
				title : 'Brew-Delta',
				description : 'test super amazing brew for 5e. Geared for Rangers.',
				authors : ['userC'],
				systems : [],
				views   : 1,
				published : true
			}
		};
	},

	populateDB : (brewCollection)=>{
		return Promise.all(_.map(brewCollection, (brewData, id) => {
			return BrewData.create(brewData)
				.then((brew)=>{
					PopulatedBrews[id] = brew;
				});
			})
		);
	},

	chaiPlugin : (chai, utils) => {
		chai.Assertion.addMethod('brews', function(...brewIds){
			new chai.Assertion(this._obj).to.be.instanceof(Array);
			const valid = _.every(brewIds, (brewId) => {
				const storedBrew = PopulatedBrews[brewId];
				if(!storedBrew) return false;
				return _.some(this._obj, (brew)=>{
					return brew.editId == storedBrew.editId &&
						brew.shareId == storedBrew.shareId &&
						brew.title == storedBrew.title &&
						brew.views == storedBrew.views;
				});
			});
			this.assert(
				valid,
				`expect #{this} to have brews ${brewIds.join(', ')}`,
				`expect #{this} to not have brews ${brewIds.join(', ')}`
			)
		});
	}
};