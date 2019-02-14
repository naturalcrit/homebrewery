const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const moment = require('moment');
const request = require('superagent');

const BrewItem = createClass({
	getDefaultProps : function() {
		return {
			brew : {
				title       : '',
				description : '',

				authors : []
			}
		};
	},

	deleteBrew : function(){
		if(this.props.brew.authors.length <= 1){
			if(!confirm('Are you sure you want to delete this brew? Because you are the only owner of this brew, the document will be deleted permanently.')) return;
			if(!confirm('Are you REALLY sure? You will not be able to recover the document.')) return;
		} else {
			if(!confirm('Are you sure you want to remove this brew from your collection? This will remove you as an editor, but other owners will still be able to access the document.')) return;
			if(!confirm('Are you REALLY sure? You will lose editor access to this document.')) return;
		}

		request.get(`/api/remove/${this.props.brew.editId}`)
			.send()
			.end(function(err, res){
				location.reload();
			});
	},

	renderDeleteBrewLink : function(){
		if(!this.props.brew.editId) return;

		return <a onClick={this.deleteBrew}>
			<i className='fa fa-trash' />
		</a>;
	},
	renderEditLink : function(){
		if(!this.props.brew.editId) return;

		return <a href={`/edit/${this.props.brew.editId}`} target='_blank' rel='noopener noreferrer'>
			<i className='fa fa-pencil' />
		</a>;
	},

	render : function(){
		const brew = this.props.brew;
		return <div className='brewItem'>
			<h2>{brew.title}</h2>
			<p className='description' >{brew.description}</p>
			<hr />

			<div className='info'>
				<span>
					<i className='fa fa-user' /> {brew.authors.join(', ')}
				</span>
				<span>
					<i className='fa fa-eye' /> {brew.views}
				</span>
				<span>
					<i className='fa fa-refresh' /> {moment(brew.updatedAt).fromNow()}
				</span>
			</div>

			<div className='links'>
				<a href={`/share/${brew.shareId}`} target='_blank' rel='noopener noreferrer'>
					<i className='fa fa-share-alt' />
				</a>
				{this.renderEditLink()}
				{this.renderDeleteBrewLink()}
			</div>
		</div>;
	}
});

module.exports = BrewItem;
