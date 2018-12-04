const React       = require('react');
const createClass = require('create-react-class');
const cx          = require('classnames');

const request = require('superagent');


const BrewCleanup = createClass({
	displayName : 'BrewCleanup',
	getDefaultProps(){
		return {};
	},
	getInitialState() {
		return {
			count : 0,

			pending : false,
			primed  : false,
			err     : null
		};
	},
	prime(){
		this.setState({ pending: true });

		request.get('/admin/cleanup')
			.then((res)=>this.setState({ count: res.body.count, primed: true }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>this.setState({ pending: false }));
	},
	cleanup(){
		this.setState({ pending: true });

		request.post('/admin/cleanup')
			.then((res)=>this.setState({ count: res.body.count }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>this.setState({ pending: false, primed: false }));
	},
	renderPrimed(){
		if(!this.state.primed) return;

		if(!this.state.count){
			return <div className='removeBox'>No Matching Brews found.</div>;
		}
		return <div className='removeBox'>
			<button onClick={this.cleanup} className='remove'>
				{this.state.pending
					? <i className='fa fa-spin fa-spinner' />
					: <span><i className='fa fa-times' /> Remove</span>
				}
			</button>
			<span>Found {this.state.count} Brews that could be removed. </span>
		</div>;
	},
	render(){
		return <div className='BrewCleanup'>
			<h2> Brew Cleanup </h2>
			<p>Removes very short brews to tidy up the database</p>

			<button onClick={this.prime} className='query'>
				{this.state.pending
					? <i className='fa fa-spin fa-spinner' />
					: 'Query Brews'
				}
			</button>
			{this.renderPrimed()}

			{this.state.error
				&& <div className='error'>{this.state.error.toString()}</div>
			}
		</div>;
	}
});

module.exports = BrewCleanup;