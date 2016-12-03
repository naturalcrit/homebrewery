const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');
const moment = require('moment');

const BrewItem = React.createClass({
	getDefaultProps: function() {
		return {
			brew : {
				title : '',
				description : '',

				authors : []
			}
		};
	},

	renderEditLink: function(){
		if(!this.props.brew.editId) return;

		return <a href={`/edit/${this.props.brew.editId}`} target='_blank'>
			<i className='fa fa-pencil' />
		</a>
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
				<a href={`/share/${brew.shareId}`} target='_blank'>
					<i className='fa fa-share-alt' />
				</a>
				{this.renderEditLink()}
			</div>
		</div>
	}
});

module.exports = BrewItem;
