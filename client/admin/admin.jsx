require('./admin.less');
const React = require('react');
const createClass = require('create-react-class');


const BrewCleanup = require('./brewCleanup/brewCleanup.jsx');
const BrewLookup = require('./brewLookup/brewLookup.jsx');
const BrewCompress = require ('./brewCompress/brewCompress.jsx');
const UserLookup = require('./userLookup/userLookup.jsx');
const Stats = require('./stats/stats.jsx');

const Admin = createClass({
	getDefaultProps : function() {
		return {};
	},

	render : function(){
		return <div className='admin'>

			<header>
				<div className='container'>
					<i className='fas fa-rocket' />
					homebrewery admin
				</div>
			</header>
			<div className='container'>
				<table>
					<th><td></td><td></td></th>
					<tr>
						<td>
							<Stats />
						</td>
					</tr>
					<tr>
						<td>
							<BrewLookup />
						</td>
						<td>
							<UserLookup />
						</td>
					</tr>
					<tr>
						<td>
							<BrewCleanup />
						</td>
					</tr>
					<tr>
						<td>
							<BrewCompress />
						</td>
					</tr>
				</table>
			</div>
		</div>;
	}
});

module.exports = Admin;
