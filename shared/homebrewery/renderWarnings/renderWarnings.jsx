
const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const RenderWarnings = React.createClass({
	getInitialState: function() {
		return {
			warnings: {}
		};
	},
	componentDidMount: function() {
		this.checkWarnings();
		window.addEventListner('onresize', this.checkWarnings);
	},
	componentWillUnmount: function() {
		window.removeEventListener('onresize', this.checkWarnings);
	},
	warnings : {
		chrome : function(){
			const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
			if(!isChrome){
				return <li key='chrome'>
					<em>Built for Chrome </em> <br />
					Other browsers do not support
					<a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/CSS/column-span#Browser_compatibility'>
						key features
					</a> this site uses.
				</li>;
			}
		},
		zoom : function(){
			if(window.devicePixelRatio !== 1){
				return <li key='zoom'>
					<em>Your browser is zoomed. </em> <br />
					This can cause content to jump columns.
				</li>;
			}
		}
	},
	checkWarnings : function(){
		this.setState({
			warnings : _.reduce(this.warnings, (r, fn, type) => {
				const element = fn();
				if(element) r[type] = element;
				return r;
			}, {})
		})
	},
	render: function(){
		if(_.isEmpty(this.state.warnings)) return null;

		return <div className='renderWarnings'>
			<i className='fa fa-exclamation-triangle' />
			<h3>Render Warnings</h3>
			<small>If this homebrew is rendering badly if might be because of the following:</small>
			<ul>{_.values(this.state.warnings)}</ul>
		</div>
	}
});

module.exports = RenderWarnings;
