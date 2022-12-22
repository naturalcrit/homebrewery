const React = require('react');
const createClass = require('create-react-class');

const BrewCleanup = require('./brewCleanup/brewCleanup.jsx');
const BrewLookup = require('./brewLookup/brewLookup.jsx');
const BrewCompress = require ('./brewCompress/brewCompress.jsx');
const Stats = require('./stats/stats.jsx');

const BrewTab = createClass({
	getDefaultProps : function() {
		return {};
	},

	render : function(){
		return <div className='container'>
			<table>
				<tbody>
					<tr>
						<td>
							<Stats />
						</td>
					</tr>
					<tr>
						<td>
							<BrewLookup />
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
				</tbody>
			</table>
		</div>;
	}
});

module.exports = BrewTab;
