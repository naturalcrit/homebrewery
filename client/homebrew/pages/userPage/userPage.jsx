const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const ListPage = require('../basePages/listPage/listPage.jsx');

const UserPage = createClass({
	displayName     : 'UserPage',
	getDefaultProps : function() {
		return {
			username : '',
			brews    : [],
		};
	},
	getInitialState : function() {
		const usernameWithS = this.props.username + (this.props.username.endsWith('s') ? `'` : `'s`);

		const brews = _.groupBy(this.props.brews, (brew)=>{
			return (brew.published ? 'published' : 'private');
		});

		const brewCollection = [
			{
				title : `${usernameWithS} published brews`,
				class : 'published',
				brews : brews.published
			}
		];
		if(this.props.username == global.account?.username){
			brewCollection.push(
				{
					title : `${usernameWithS} unpublished brews`,
					class : 'unpublished',
					brews : brews.private
				}
			);
		}

		return {
			brewCollection : brewCollection
		};
	},

	render : function(){
		return <ListPage brewCollection={this.state.brewCollection} ></ListPage>;
	}
});

module.exports = UserPage;
