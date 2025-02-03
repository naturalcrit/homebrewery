const React       = require('react');
const createClass = require('create-react-class');

const request = require('superagent');

const Stats = createClass({
	displayName : 'Stats',
	getDefaultProps(){
		return {};
	},
	getInitialState(){
		return {
			stats : {
				totalBrews          : 0,
				totalPublishedBrews : 0
			},
			fetching : false
		};
	},
	componentDidMount(){
		this.fetchStats();
	},
	fetchStats(){
		this.setState({ fetching: true });
		request.get('/admin/stats')
			.then((res)=>this.setState({ stats: res.body }))
			.finally(()=>this.setState({ fetching: false }));
	},
	render(){
		return <div className='brewUtil stats'>
			<h2> Stats </h2>
			<dl>
				<dt>Total Brew Count</dt>
				<dd>{this.state.stats.totalBrews}</dd>
				<dt>Total Brews Published</dt>
				<dd>{this.state.stats.totalPublishedBrews}</dd>
			</dl>

			{this.state.fetching
				&& <div className='pending'><i className='fas fa-spin fa-spinner' /></div>
			}
		</div>;
	}
});

module.exports = Stats;
