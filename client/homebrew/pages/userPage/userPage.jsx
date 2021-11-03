require('./userPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const ListPage = require('../basePages/listPage/listPage.jsx');

// const brew = {
// 	title   : 'SUPER Long title woah now',
// 	authors : []
// };

//const BREWS = _.times(25, ()=>{ return brew;});


const UserPage = createClass({
	getDefaultProps : function() {
		return {
			username : '',
			brews    : [],
		};
	},
	getInitialState : function() {
		return {
			sortType     : 'alpha',
			sortDir      : 'asc',
			filterString : ''
		};
	},
	getUsernameWithS : function() {
		if(this.props.username.endsWith('s'))
			return `${this.props.username}'`;
		return `${this.props.username}'s`;
	},

	getSortedBrews : function(){
		return _.groupBy(this.props.brews, (brew)=>{
			return (brew.published ? 'published' : 'private');
		});
	},

	render : function(){
		const brews = this.getSortedBrews();

		const brewCollections = [
			{
				title : `${this.getUsernameWithS()} published brews`,
				class : 'published',
				brews : brews.published
			}
		];
		if(this.props.username == global.account?.username){
			brewCollections.push(
				{
					title : `${this.getUsernameWithS()} unpublished brews`,
					class : 'unpublished',
					brews : brews.private
				}
			);
		}

		return <ListPage brewCollection={brewCollections} ></ListPage>;
	}
});

module.exports = UserPage;
