const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');
const request = require('superagent');

const Moment = require('moment');


const BrewLookup = require('./brewLookup/brewLookup.jsx');


const HomebrewAdmin = createClass({
	getDefaultProps : function() {
		return {
			admin_key : ''
		};
	},

	getInitialState : function() {
		return {
			page      : 0,
			count     : 20,
			brewCache : {},
			total     : 0,
		};
	},


	fetchBrews : function(page){
		request.get('/api/search')
			.query({
				admin_key : this.props.admin_key,
				count     : this.state.count,
				page      : page
			})
			.end((err, res)=>{
				if(err || !res.body || !res.body.brews) return;
				const newCache = _.extend({}, this.state.brewCache);
				newCache[page] = res.body.brews;
				this.setState({
					brewCache : newCache,
					total     : res.body.total,
					count     : res.body.count
				});
			});
	},

	componentDidMount : function() {
		this.fetchBrews(this.state.page);
	},

	changePageTo : function(page){
		if(!this.state.brewCache[page]){
			this.fetchBrews(page);
		}
		this.setState({
			page : page
		});
	},


	clearInvalidBrews : function(){
		request.get('/api/invalid')
			.query({ admin_key: this.props.admin_key })
			.end((err, res)=>{
				if(!confirm(`This will remove ${res.body.count} brews. Are you sure?`)) return;
				request.get('/api/invalid')
					.query({ admin_key: this.props.admin_key, do_it: true })
					.end((err, res)=>{
						alert('Done!');
					});
			});
	},


	deleteBrew : function(brewId){
		if(!confirm(`Are you sure you want to delete '${brewId}'?`)) return;
		request.get(`/api/remove/${brewId}`)
			.query({ admin_key: this.props.admin_key })
			.end(function(err, res){
				window.location.reload();
			});
	},

	handlePageChange : function(dir){
		this.changePageTo(this.state.page + dir);
	},


	renderPagnination : function(){
		let outOf;
		if(this.state.total){
			outOf = `${this.state.page} / ${Math.round(this.state.total/this.state.count)}`;
		}
		return <div className='pagnination'>
			<i className='fa fa-chevron-left' onClick={()=>this.handlePageChange(-1)}/>
			{outOf}
			<i className='fa fa-chevron-right' onClick={()=>this.handlePageChange(1)}/>
		</div>;
	},


	renderBrews : function(){
		const brews = this.state.brewCache[this.state.page] || _.times(this.state.count);
		return _.map(brews, (brew)=>{
			return <tr className={cx('brewRow', { 'isEmpty': brew.text == 'false' })} key={brew.shareId || brew}>
				<td><a href={`/edit/${brew.editId}`} target='_blank' rel='noopener noreferrer'>{brew.editId}</a></td>
				<td><a href={`/share/${brew.shareId}`} target='_blank' rel='noopener noreferrer'>{brew.shareId}</a></td>
				<td>{Moment(brew.createdAt).fromNow()}</td>
				<td>{Moment(brew.updatedAt).fromNow()}</td>
				<td>{Moment(brew.lastViewed).fromNow()}</td>
				<td>{brew.views}</td>
				<td>
					<div className='deleteButton' onClick={()=>this.deleteBrew(brew.editId)}>
						<i className='fa fa-trash' />
					</div>
				</td>
			</tr>;
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
		</div>;
	},

	render : function(){
		return <div className='homebrewAdmin'>

			<BrewLookup adminKey={this.props.admin_key} />

			{/*
			<h2>
				Homebrews - {this.state.total}
			</h2>





			{this.renderPagnination()}
			{this.renderBrewTable()}

			<button className='clearOldButton' onClick={this.clearInvalidBrews}>
				Clear Old
			</button>

			<BrewSearch admin_key={this.props.admin_key} />
		*/}
		</div>;
	}
});

module.exports = HomebrewAdmin;
