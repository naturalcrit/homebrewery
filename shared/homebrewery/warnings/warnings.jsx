
const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const Warnings = React.createClass({
	getInitialState: function() {
		return {
			warnings: {}
		};
	},
	componentDidMount: function() {
		this.checkWarnings();

		//TODO: Setup event for window zoom

	},
	warnings : {
		chrome : function(){
			const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
			if(isChrome){
				return 'OPtimized for Chrome';
			}
		},
		zoom : function(){
			if(window.devicePixelRatio !== 1){
				return 'You are zoomed';
			}
		}
	},
	checkWarnings : function(){
		this.setState({
			warnings : _.reduce(this.warnings, (r, fn, type) => {
				const text = fn();
				if(text) r[type] = text;
				return r;
			}, {})
		})
	},
	render: function(){
		if(_.isEmpty(this.state.warnings)) return null;

		const errors = _.map(this.state.warnings, (text, idx) => {
			return <li key={idx}>{text}</li>
		});

		return <div className='warnings'>
			<i className='fa fa-exclamation-triangle' />
			<h3>Rendering Warnings</h3>
			<small>If this homebrew is rendering badly if might be because of the following:</small>
			<ul>{errors}</ul>
		</div>
	}
});

module.exports = Warnings;
