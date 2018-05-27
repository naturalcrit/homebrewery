
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const DISMISS_KEY = 'dismiss_render_warning';

const RenderWarnings = createClass({
	getInitialState : function() {
		return {
			warnings : {}
		};
	},
	componentDidMount : function() {
		this.checkWarnings();
		window.addEventListener('resize', this.checkWarnings);
	},
	componentWillUnmount : function() {
		window.removeEventListener('resize', this.checkWarnings);
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
	},
	checkWarnings : function(){
		const hideDismiss = localStorage.getItem(DISMISS_KEY);
		if(hideDismiss) return this.setState({ warnings: {} });

		this.setState({
			warnings : _.reduce(this.warnings, (r, fn, type)=>{
				const element = fn();
				if(element) r[type] = element;
				return r;
			}, {})
		});
	},
	dismiss : function(){
		localStorage.setItem(DISMISS_KEY, true);
		this.checkWarnings();
	},
	render : function(){
		if(_.isEmpty(this.state.warnings)) return null;

		return <div className='renderWarnings'>
			<i className='fa fa-times dismiss' onClick={this.dismiss}/>
			<i className='fa fa-exclamation-triangle ohno' />
			<h3>Render Warnings</h3>
			<small>If this homebrew is rendering badly if might be because of the following:</small>
			<ul>{_.values(this.state.warnings)}</ul>
		</div>;
	}
});

module.exports = RenderWarnings;
