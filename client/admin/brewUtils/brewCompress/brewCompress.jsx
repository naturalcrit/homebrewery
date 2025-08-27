const React       = require('react');
const createClass = require('create-react-class');
const request = require('superagent');

const BrewCompress = createClass({
	displayName : 'BrewCompress',
	getDefaultProps(){
		return {};
	},
	getInitialState() {
		return {
			count      : 0,
			batchRange : 0,

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
		const brews = this.state.ids;
		const compressBatches = ()=>{
			if(brews.length == 0){
				this.setState({ pending: false, primed: false });
				return;
			}
			const batch = brews.splice(0, 1000);	// Process brews in batches of 1000
			this.setState({ batchRange: this.state.count - brews.length });
			batch.forEach((id, idx)=>{
				request.put(`/admin/compress/${id}`)
					.catch((err)=>this.setState({ error: err }));
			});
			setTimeout(compressBatches, 10000);		//Wait 10 seconds between batches
		};

		this.setState({ pending: true });

		compressBatches();
	},
	renderPrimed(){
		if(!this.state.primed) return;

		if(!this.state.count){
			return <div className='result noBrews'>No Matching Brews found.</div>;
		}
		return <div className='result'>
			<button onClick={this.cleanup} className='remove'>
				{this.state.pending
					? <i className='fas fa-spin fa-spinner' />
					: <span><i className='fas fa-compress' /> compress </span>
				}
			</button>
			{this.state.pending
				? <span>Compressing {this.state.batchRange} brews. </span>
				: <span>Found {this.state.count} Brews that could be compressed. </span>
			}
		</div>;
	},
	render(){
		return <div className='brewUtil brewCompress'>
			<h2> Brew Compression </h2>
			<p>Compresses the text in brews to binary</p>

			<button onClick={this.prime} className='query'>
				{this.state.pending
					? <i className='fas fa-spin fa-spinner' />
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
