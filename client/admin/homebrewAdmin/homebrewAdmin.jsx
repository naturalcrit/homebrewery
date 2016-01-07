var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Moment = require('moment')

var HomebrewAdmin = React.createClass({

	getDefaultProps: function() {
		return {
			homebrews : [],
			admin_key : ''
		};
	},

	renderBrews : function(){
		return _.map(this.props.homebrews, (brew)=>{
			return <tr className={cx('brewRow', {'isEmpty' : brew.text == ""})} key={brew.sharedId}>

				<td>{brew.editId}</td>
				<td>{Moment(brew.createdAt).fromNow()}</td>
				<td>{Moment(brew.updatedAt).fromNow()}</td>
				<td>{Moment(brew.lastViewed).fromNow()}</td>
				<td>{brew.views}</td>

				<td><a target="_blank" href={'/homebrew/share/' + brew.shareId}>view</a></td>
				<td><a href={'/homebrew/remove/' + brew.editId +'?admin_key=' + this.props.admin_key}><i className='fa fa-trash' /></a></td>
			</tr>

		})
	},

	render : function(){
		var self = this;
		return(
			<div className='homebrewAdmin'>
				<h2>Homebrews - {this.props.homebrews.length}</h2>
				<table>
					<thead>
						<tr>
							<th>Edit Id</th>
							<th>Created At</th>
							<th>Last Updated</th>
							<th>Last Viewed</th>
							<th>Number of Views</th>
							<th>Preview</th>
						</tr>
					</thead>
					<tbody>
						{this.renderBrews()}
					</tbody>
				</table>
			</div>
		);
	}
});

module.exports = HomebrewAdmin;
