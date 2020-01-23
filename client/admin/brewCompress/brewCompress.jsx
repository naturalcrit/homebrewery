const React       = require('react');
const createClass = require('create-react-class');
const cx          = require('classnames');

const request = require('superagent');


const BrewCompress = createClass({
	displayName : 'BrewCompress',
	getDefaultProps(){
		return {};
	},
	getInitialState() {
		return {
			count : 0,

			pending : false,
			primed  : false,
			err     : null,
			ids     : null
		};
	},
	prime(){
		this.setState({ pending: true });

		request.get('/admin/finduncompressed')
			.then((res)=>this.setState({ count: res.body.count, primed: true, ids: res.body.ids }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>this.setState({ pending: false }));
	},
	cleanup(){
		this.setState({ pending: true });
		this.state.ids.forEach((id) => {
			console.log("trying to compress this one:");
			console.log(id);
			request.put(`/admin/compress/${id}`)
				.catch((err)=>this.setState({ error: err }))
				.finally(()=>this.setState({ pending: false, primed: false }));
		});
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
					: <span><i className='fa fa-compress' /> compress </span>
				}
			</button>
			<span>Found {this.state.count} Brews that could be compressed. </span>
		</div>;
	},
	render(){
		return <div className='BrewCompress'>
			<h2> Brew Compression </h2>
			<p>Compresses the text in brews to binary</p>

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

module.exports = BrewCompress;