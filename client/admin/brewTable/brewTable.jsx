const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const Moment = require('moment');

//TODO: Add in delete

const BrewTable = React.createClass({
	getDefaultProps: function() {
		return {
			brews : []
		};
	},
	renderRows : function(){
		return _.map(this.props.brews, (brew) => {
			let authors = 'None.';
			if(brew.authors && brew.authors.length) authors = brew.authors.join(', ');

			return <tr className={cx('brewRow', {'isEmpty' : brew.text == "false"})} key={brew.shareId || brew}>
				<td>{brew.title}</td>
				<td>{authors}</td>
				<td><a href={'/edit/' + brew.editId} target='_blank'>{brew.editId}</a></td>
				<td><a href={'/share/' + brew.shareId} target='_blank'>{brew.shareId}</a></td>
				<td>{Moment(brew.updatedAt).fromNow()}</td>
				<td>{brew.views}</td>
				<td className='deleteButton'>
					<i className='fa fa-trash' />
				</td>
			</tr>

		});
	},
	render: function(){
		return <table className='brewTable'>
				<thead>
					<tr>
						<th>Title</th>
						<th>Authors</th>
						<th>Edit Link</th>
						<th>Share Link</th>
						<th>Last Updated</th>
						<th>Views</th>
						<th>Remove</th>
					</tr>
				</thead>
				<tbody>
					{this.renderRows()}
				</tbody>
			</table>
	}
});

module.exports = BrewTable;
