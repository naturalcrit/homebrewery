/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./lockTools.less');
const React = require('react');
const createClass = require('create-react-class');

// const request = require('superagent');
const request = require('../../homebrew/utils/request-middleware.js');

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
		const newCount = await request.get('/api/lock/count')
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
			<LockTable title='Brews Awaiting Review' resultName='reviewDocuments' fetchURL='/api/lock/reviews' propertyNames={['shareId', 'title']} ></LockTable>
			<hr />
			<LockBrew></LockBrew>
			<hr />
			<div style={{ columns: 2 }}>
				<LockLookup title='Unlock Brew' fetchURL='/api/unlock' updateFn={this.updateReviewCount}></LockLookup>
				<LockLookup title='Clear Review Request' fetchURL='/api/lock/review/remove'></LockLookup>
			</div>
			<hr />
		</div>;
	}
});

const LockBrew = createClass({
	getInitialState : function() {
		// Default values
		return {
			brewId       : '',
			code         : 455,
			editMessage  : '',
			shareMessage : 'This Brew has been locked.',
			result       : {}
		};
	},

	handleChange : function(e, varName) {
		const output = {};
		output[varName] = e.target.value;
		this.setState(output);
	},

	submit : function(e){
		e.preventDefault();
		if(!this.state.editMessage) return;
		const newLock = {
			code         : parseInt(this.state.code) || 100,
			editMessage  : this.state.editMessage,
			shareMessage : this.state.shareMessage,
			applied      : new Date
		};

		request.post(`/api/lock/${this.state.brewId}`)
			.send(newLock)
			.set('Content-Type', 'application/json')
			.then((response)=>{
				this.setState({ result: response.body });
			});
	},

	renderInput : function (name) {
		return <input type='text' name={name} value={this.state[name]} onChange={(e)=>this.handleChange(e, name)} autoComplete='off' required/>;
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
		return <div className='lockBrew'>
			<div className='lockForm'>
				<h2>Lock Brew</h2>
				<form onSubmit={this.submit}>
					<label>
						ID:
						{this.renderInput('brewId')}
					</label>
					<br />
					<label>
						Error Code:
						{this.renderInput('code')}
					</label>
					<br />
					<label>
						Edit Message:
						{this.renderInput('editMessage')}
					</label>
					<br />
					<label>
						Share Message:
						{this.renderInput('shareMessage')}
					</label>
					<br />
					<label>
						<input type='submit' />
					</label>
				</form>
				{this.state.result && this.renderResult()}
			</div>
			<div className='lockSuggestions'>
				<h2>Suggestions</h2>
				<div className='lockCodes'>
					<h3>Codes</h3>
					<ul>
						<li>455 - Generic Lock</li>
						<li>456 - Copyright issues</li>
						<li>457 - Confidential Information Leakage</li>
						<li>458 - Sensitive Personal Information</li>
						<li>459 - Defamation or Libel</li>
						<li>460 - Hate Speech or Discrimination</li>
						<li>461 - Illegal Activities</li>
						<li>462 - Malware or Phishing</li>
						<li>463 - Plagiarism</li>
						<li>465 - Misrepresentation</li>
						<li>466 - Inappropriate Content</li>
					</ul>
				</div>
				<div className='lockMessages'>
					<h3>Messages</h3>
					<ul>
						<li><b>Edit Message:</b> This is the private message that is ONLY displayed to the authors of the locked brew. This message MUST specify exactly what actions must be taken in order to have the brew unlocked.</li>
						<li><b>Share Message:</b> This is the public message that is displayed to the EVERYONE that attempts to view the locked brew.</li>
					</ul>
				</div>
			</div>
		</div>;
	}
});

const LockTable = createClass({
	getDefaultProps : function() {
		return {
			title         : '',
			fetchURL      : '/api/locks',
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
			<div className='brewsAwaitingReview'>
				<div className='brewBlock'>
					<h2>{this.props.title}</h2>
					<button onClick={this.clickFn}>
						REFRESH
						<i className={`fas ${!this.state.searching ? 'fa-search' : 'fa-spin fa-spinner'}`} />
					</button>
				</div>
				{this.state.result[this.props.resultName] &&
				<>
					<p>Total Reviews Waiting: {this.state.result[this.props.resultName].length}</p>
					<table className='lockTable'>
						<thead>
							<tr>
								{this.props.propertyNames.map((name, idx)=>{
									return <th key={idx}>{name}</th>;
								})}
								<th>clip</th>
								<th>view</th>
							</tr>
						</thead>
						<tbody>
							{this.state.result[this.props.resultName].map((result, resultIdx)=>{
								return <tr className='row' key={`${resultIdx}-row`}>
									{this.props.propertyNames.map((name, nameIdx)=>{
										return <td key={`${resultIdx}-${nameIdx}`}>
											{result[name].toString()}
										</td>;
									})}
									<td className='icon' onClick={()=>{navigator.clipboard.writeText(result.shareId.toString());}}><i className='fa-regular fa-clipboard'></i></td>
									<td className='icon'><i className='fa-regular fa-circle-right'></i></td>
								</tr>;
							})}
						</tbody>
					</table>
				</>
				}
			</div>
		</>;
	}
});

const LockLookup = createClass({
	getDefaultProps : function() {
		return {
			fetchURL : '/api/lookup'
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

		request.put(`${this.props.fetchURL}/${this.state.query}`)
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
			<input type='text' value={this.state.query} onChange={this.handleChange} placeholder='share id' />
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