const React       = require('react');
const createClass = require('create-react-class');
const cx          = require('classnames');

const request = require('superagent');


const BrewCleanup = createClass({
	displayName : 'BrewCleanup',
	getDefaultProps(){
		return {
			adminKey : '',
		};
	},
	getInitialState() {
		return {
			count : 0,

			pending : false,
			primed : false
		};
	},
	prime(){
		if(this.state.primed) return this.cleanup();
		this.setState({ pending: true });

		request.get('/admin/cleanup')
			.query({ admin_key: this.props.adminKey })
			.then((res)=> this.setState({count : res.body.count }))
			.catch((err)=>this.setState({ error : err }))
			.finally(()=>this.setState({ pending : false }))
	},
	cleanup(){
		this.setState({ pending: true });

		request.post('/admin/cleanup')
			.query({ admin_key: this.props.adminKey })
			.then((res)=> this.setState({count : res.body.count }))
			.catch((err)=>this.setState({ error : err }))
			.finally(()=>this.setState({ pending : false, primed : false }))
	},
	render(){
		return <div className='BrewCleanup'>
			BrewCleanup Component Ready.
		</div>;
	}
});

module.exports = BrewCleanup;