var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var request = require('superagent');

var Moment = require('moment');

var BrewSearch = require('./brewSearch.jsx');


var HomebrewAdmin = React.createClass({
	getDefaultProps: function() {
		return {
			admin_key : ''
		};
	},

	getInitialState: function() {
		return {
			page: 0,
			count : 20,
			brewCache : {},
			total : 0,

			processingOldBrews : false
		};
	},


	fetchBrews : function(page){
		request.get('/homebrew/api/search')
			.query({
				admin_key : this.props.admin_key,
				count : this.state.count,
				page : page
			})
			.end((err, res)=>{
				this.state.brewCache[page] = res.body.brews;
				this.setState({
					brewCache : this.state.brewCache,
					total : res.body.total,
					count : res.body.count
				})
			})
	},

	componentDidMount: function() {
		this.fetchBrews(this.state.page);
	},

	changePageTo : function(page){
		if(!this.state.brewCache[page]){
			this.fetchBrews(page);
		}
		this.setState({
			page : page
		})
	},


	clearInvalidBrews : function(){
		request.get('/homebrew/api/invalid')
			.query({admin_key : this.props.admin_key})
			.end((err, res)=>{
				if(!confirm("This will remove " + res.body.count + " brews. Are you sure?")) return;
				request.get('/homebrew/api/invalid')
					.query({admin_key : this.props.admin_key, do_it : true})
					.end((err, res)=>{
						alert("Done!")
					});
			});
	},


	deleteBrew : function(brewId){
		if(!confirm("Are you sure you want to delete '" + brewId + "'?")) return;
		request.get('/homebrew/api/remove/' + brewId)
			.query({admin_key : this.props.admin_key})
			.end(function(err, res){
				window.location.reload();
			})
	},

	handlePageChange : function(dir){
		this.changePageTo(this.state.page + dir);
	},


	renderPagnination : function(){
		var outOf;
		if(this.state.total){
			outOf = this.state.page + ' / ' + Math.round(this.state.total/this.state.count);
		}
		return <div className='pagnination'>
			<i className='fa fa-chevron-left' onClick={this.handlePageChange.bind(this, -1)}/>
			{outOf}
			<i className='fa fa-chevron-right' onClick={this.handlePageChange.bind(this, 1)}/>
		</div>
	},


	renderBrews : function(){
		var brews = this.state.brewCache[this.state.page] || _.times(this.state.count);
		return _.map(brews, (brew)=>{
			return <tr className={cx('brewRow', {'isEmpty' : brew.text == "false"})} key={brew.shareId || brew}>
				<td><a href={'/homebrew/edit/' + brew.editId} target='_blank'>{brew.editId}</a></td>
				<td><a href={'/homebrew/share/' + brew.shareId} target='_blank'>{brew.shareId}</a></td>
				<td>{Moment(brew.createdAt).fromNow()}</td>
				<td>{Moment(brew.updatedAt).fromNow()}</td>
				<td>{Moment(brew.lastViewed).fromNow()}</td>
				<td>{brew.views}</td>
				<td>
					<div className='deleteButton' onClick={this.deleteBrew.bind(this, brew.editId)}>
						<i className='fa fa-trash' />
					</div>
				</td>
			</tr>
		});
	},

	renderBrewTable : function(){
		return <div className='brewTable'>
			<table>
				<thead>
					<tr>
						<th>Edit Id</th>
						<th>Share Id</th>
						<th>Created At</th>
						<th>Last Updated</th>
						<th>Last Viewed</th>
						<th>Views</th>
					</tr>
				</thead>
				<tbody>
					{this.renderBrews()}
				</tbody>
			</table>
		</div>
	},

	render : function(){
		var self = this;
		return <div className='homebrewAdmin'>
			<h2>
				Homebrews - {this.state.total}
			</h2>
			{this.renderPagnination()}
			{this.renderBrewTable()}

			<button className='clearOldButton' onClick={this.clearInvalidBrews}>
				Clear Old
			</button>

			<BrewSearch admin_key={this.props.admin_key} />
		</div>
	}
});

module.exports = HomebrewAdmin;
