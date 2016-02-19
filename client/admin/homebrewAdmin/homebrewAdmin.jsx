var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Moment = require('moment');

var VIEW_LIMIT = 30;
var COLUMN_HEIGHT = 52;

var HomebrewAdmin = React.createClass({
	getDefaultProps: function() {
		return {
			homebrews : [],
			admin_key : ''
		};
	},

	getInitialState: function() {
		return {
			viewStartIndex: 0
		};
	},

	renderBrews : function(){
		return _.times(VIEW_LIMIT, (i)=>{
			var brew = this.props.homebrews[i + this.state.viewStartIndex];
			if(!brew) return null;

			return <tr className={cx('brewRow', {'isEmpty' : brew.text == ""})} key={brew.sharedId}>

				<td><a href={'/homebrew/edit/' + brew.editId} target='_blank'>{brew.editId}</a></td>
				<td><a href={'/homebrew/share/' + brew.shareId} target='_blank'>{brew.shareId}</a></td>
				<td>{Moment(brew.createdAt).fromNow()}</td>
				<td>{Moment(brew.updatedAt).fromNow()}</td>
				<td>{Moment(brew.lastViewed).fromNow()}</td>
				<td>{brew.views}</td>

				<td><a href={'/homebrew/remove/' + brew.editId +'?admin_key=' + this.props.admin_key}><i className='fa fa-trash' /></a></td>
			</tr>
		});
	},

	render : function(){
		var self = this;
		return(
			<div className='homebrewAdmin'>
				<h2>Homebrews - {this.props.homebrews.length}</h2>
				<div className='brewTable'>
					<table>
						<thead>
							<tr>
								<th>Edit Id</th>
								<th>Share Id</th>
								<th>Created At</th>
								<th>Last Updated</th>
								<th>Last Viewed</th>
								<th>Number of Views</th>
							</tr>
						</thead>
						<tbody>
							{this.renderBrews()}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
});

module.exports = HomebrewAdmin;
