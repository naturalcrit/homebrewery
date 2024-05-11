require('./lockTools.less');
const React = require('react');
const createClass = require('create-react-class');

const request = require('superagent');

const LockTools = createClass({
	getInitialState : function() {
		return {
			fetching    : false,
			reviewCount : 0
		};
	},

	componentDidMount : function() {
		this.updateReviewCount();
	},

	updateReviewCount : async function() {
		const newCount = await request.get('/admin/lock')
            .then((res)=>{return res.body?.count || 'Unknown';});
		if(newCount != this.state.reviewCount){
			this.setState({
				reviewCount : newCount
			});
		}
	},

	render : function() {
		return <div className='lockTools'>
			<h2>Lock Count</h2>
			<p>Number of brews currently locked: {this.state.reviewCount}</p>
			<button onClick={this.updateReviewCount}>REFRESH</button>
			<hr />
			<LockTable title='Brews Awaiting Review' resultName='reviewDocuments' fetchURL='/admin/lock/reviews' propertyNames={['shareId', 'title']} ></LockTable>
			<hr />
			<h2>Lock Brew</h2>
			<LockLookup>NYI</LockLookup>
			<hr />
			<LockLookup title='Unlock Brew' fetchURL='/admin/unlock' updateFn={this.updateReviewCount}></LockLookup>
			<hr />
			<LockLookup title='Clear Review Request' fetchURL='/admin/lock/review/remove'></LockLookup>
		</div>;
	}
});

const LockTable = createClass({
	getDefaultProps : function() {
		return {
			title         : '',
			fetchURL      : '/admin/locks',
			resultName    : '',
			propertyNames : ['shareId']
		};
	},

	getInitialState : function() {
		return {
			result    : '',
			error     : '',
			searching : false
		};
	},

	clickFn(){
		this.setState({ searching: true, error: null });

		request.get(this.props.fetchURL)
			.then((res)=>this.setState({ result: res.body }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>{
				this.setState({ searching: false });
			});
	},

	render : function () {
		return <>
			<h2>{this.props.title}</h2>
			<button onClick={this.clickFn}>
				<i className={`fas ${!this.state.searching ? 'fa-search' : 'fa-spin fa-spinner'}`} />
			</button>
			{this.state.result[this.props.resultName] &&
            <>
            	<p>Total Reviews Waiting: {this.state.result[this.props.resultName].length}</p>
            	<table>
            		<thead>
            			<tr>
            				{this.props.propertyNames.map((name, idx)=>{
            					return <th key={idx}>{name}</th>;
            				})}
            			</tr>
            		</thead>
                	<tbody>
                		{this.state.result[this.props.resultName].map((result, resultIdx)=>{
                			return <tr key={`${resultIdx}-row`} onClick={()=>{navigator.clipboard.writeText(result.shareId.toString());}}>
            					{this.props.propertyNames.map((name, nameIdx)=>{
                				return <td key={`${resultIdx}-${nameIdx}`}>
            							{result[name].toString()}
            						</td>;
                			})}
            				</tr>;
            			})}
                	</tbody>
            	</table>
            </>
			}
		</>;
	}
});

const LockLookup = createClass({
	getDefaultProps : function() {
		return {
			fetchURL : '/admin/lookup'
		};
	},

	getInitialState : function() {
		return {
			query     : '',
			result    : '',
			error     : '',
			searching : false
		};
	},

	handleChange(e){
		this.setState({ query: e.target.value });
	},

	clickFn(){
		this.setState({ searching: true, error: null });

		request.get(`${this.props.fetchURL}/${this.state.query}`)
			.then((res)=>this.setState({ result: res.body }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>{
				this.setState({ searching: false });
			});
	},

	renderResult : function(){
		return <>
			<h3>Result:</h3>
			<table>
				<tbody>
					{Object.keys(this.state.result).map((key, idx)=>{
						return <tr key={`${idx}-row`}>
							<td key={`${idx}-key`}>{key}</td>
							<td key={`${idx}-value`}>{this.state.result[key].toString()}
							</td>
						</tr>;
					})}
				</tbody>
			</table>
		</>;
	},

	render : function() {
		return <div className='brewLookup'>
			<h2>{this.props.title}</h2>
			<input type='text' value={this.state.query} onChange={this.handleChange} placeholder='edit or share id' />
			<button onClick={this.clickFn}>
				<i className={`fas ${!this.state.searching ? 'fa-search' : 'fa-spin fa-spinner'}`} />
			</button>

			{this.state.error
				&& <div className='error'>{this.state.error.toString()}</div>
			}

			{this.state.result && this.renderResult()}
		</div>;
	}
});

module.exports = LockTools;