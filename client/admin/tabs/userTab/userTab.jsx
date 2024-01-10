const React = require('react');
const createClass = require('create-react-class');

const UserLookup = require('./userLookup/userLookup.jsx');
const BadgeList = require('./badgeList/badgeList.jsx');

const badgesJson = require('./badges.json');

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
					<tr>
						<td>
							<BadgeList badges={badgesJson} />
						</td>
					</tr>
				</tbody>
			</table>
		</div>;
	}
});

module.exports = UserTab;
