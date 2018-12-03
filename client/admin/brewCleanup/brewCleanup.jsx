const React       = require('react');
const createClass = require('create-react-class');
const cx          = require('classnames');


const BrewCleanup = createClass({
	displayName : 'BrewCleanup',
	getDefaultProps(){
		return {
		};
	},
	render(){
		return <div className='BrewCleanup'>
			BrewCleanup Component Ready.
		</div>;
	}
});

module.exports = BrewCleanup;