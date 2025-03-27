const React = require('react');
const createClass = require('create-react-class');
require('./brewUtils.less');

const BrewCleanup = require('./brewCleanup/brewCleanup.jsx');
const BrewLookup = require('./brewLookup/brewLookup.jsx');
const BrewCompress = require ('./brewCompress/brewCompress.jsx');
const Stats = require('./stats/stats.jsx');

const BrewUtils = createClass({
	render : function(){
		return <>
			<Stats />
			<hr />
			<BrewLookup />
			<hr />
			<BrewCleanup />
			<hr />
			<BrewCompress />
		</>;
	}
});

module.exports = BrewUtils;
