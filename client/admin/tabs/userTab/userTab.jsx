const React = require('react');
const createClass = require('create-react-class');

const UserLookup = require('./userLookup/userLookup.jsx');

const UserTab = createClass({
	getDefaultProps : function() {
		return {};
	},

	render : function(){
		return <div className='container'>
			<table>
				<tbody>
					<tr>
						<td>
							<UserLookup />
						</td>
					</tr>
				</tbody>
			</table>
		</div>;
	}
});

module.exports = UserTab;
