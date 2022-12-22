const React = require('react');
const createClass = require('create-react-class');
const cx    = require('classnames');
const _ = require('lodash');

const BadgeList = createClass({
	getDefaultProps() {
		return {
			badges : [{
				title   : 'placeholder',
				svgPath : 'sun.svg'
			}]
		};
	},

	renderBadgeList() {
		return _.map(this.props.badges, (badge, idx)=>{
			return <div key={idx}>
				<h3>{badge.title}</h3>
				<img src={`/assets/badgeSvg/${badge.svgPath}`} style={{ width: '50px' }} />
			</div>;
		});
	},

	render(){
		return <div className='userLookup'>
			<h2>Badges</h2>
			{this.renderBadgeList()}
		</div>;
	}
});

module.exports = BadgeList;
