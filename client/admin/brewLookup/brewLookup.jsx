const React = require('react');
const createClass = require('create-react-class');
const cx    = require('classnames');

const request = require('superagent');
const Moment = require('moment');


const BrewLookup = createClass({
	getDefaultProps() {
		return {};
	},
	getInitialState() {
		return {
			query     : '',
			foundBrew : null,
			searching : false,
			error     : null
		};
	},
	handleChange(e){
		this.setState({ query: e.target.value });
	},
	lookup(){
		this.setState({ searching: true, error: null });

		request.get(`/admin/lookup/${this.state.query}`)
			.then((res)=>this.setState({ foundBrew: res.body }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>this.setState({ searching: false }));
	},

	renderFoundBrew(){
		const brew = this.state.foundBrew;
		return <div className='foundBrew'>
			<dl>
				<dt>Title</dt>
				<dd>{brew.title}</dd>

				<dt>Authors</dt>
				<dd>{brew.authors.join(', ')}</dd>

				<dt>Edit Link</dt>
				<dd><a href={`/edit/${brew.editId}`} target='_blank' rel='noopener noreferrer'>/edit/{brew.editId}</a></dd>

				<dt>Share Link</dt>
				<dd><a href={`/share/${brew.shareId}`} target='_blank' rel='noopener noreferrer'>/share/{brew.shareId}</a></dd>

				<dt>Last Updated</dt>
				<dd>{Moment(brew.updatedAt).fromNow()}</dd>

				<dt>Num of Views</dt>
				<dd>{brew.views}</dd>
			</dl>
		</div>;
	},

	render(){
		return <div className='brewLookup'>
			<h2>Brew Lookup</h2>
			<input type='text' value={this.state.query} onChange={this.handleChange} placeholder='edit or share id' />
			<button onClick={this.lookup}>
				<i className={cx('fa', {
					'fa-search'          : !this.state.searching,
					'fa-spin fa-spinner' : this.state.searching,
				})} />
			</button>

			{this.state.error
				&& <div className='error'>{this.state.error.toString()}</div>
			}

			{this.state.foundBrew
				? this.renderFoundBrew()
				: <div className='noBrew'>No brew found.</div>
			}
		</div>;
	}
});

module.exports = BrewLookup;
