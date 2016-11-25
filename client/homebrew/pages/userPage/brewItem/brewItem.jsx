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

	render : function(){
		const brew = this.props.brew;
		return <div className='brewItem'>
			<h4>{brew.title}</h4>
			<p className='description'><em>{brew.description}</em></p>
			<hr />
			<ul>
				<li><strong>Authors: </strong> {brew.authors.join(', ')}</li>
				<li>
					<strong>Last updated: </strong>
					{moment(brew.updatedAt).fromNow()}
				</li>
				<li><strong>Views: </strong> {brew.views} </li>
			</ul>

			<a href={`/share/${brew.shareId}`} target='_blank'>Share link</a>
			{(!!brew.editId ? <a href={`/edit/${brew.editId}`} target='_blank'>Edit link</a> : null)}
		</div>
	}
});

module.exports = BrewItem;
