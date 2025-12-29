require('./renderWarnings.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');

import Dialog from '../dialog.jsx';

const RenderWarnings = createClass({
	displayName     : 'RenderWarnings',
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
					Other browsers have not been tested for compatibility. If you
					experience issues with your document not rendering or printing
					properly, please try using the latest version of Chrome before
					submitting a bug report.
				</li>;
			}
		},
	},
	checkWarnings : function(){
		this.setState({
			warnings : _.reduce(this.warnings, (r, fn, type)=>{
				const element = fn();
				if(element) r[type] = element;
				return r;
			}, {})
		});
	},
	render : function(){
		if(_.isEmpty(this.state.warnings)) return null;

		const DISMISS_KEY = 'dismiss_render_warning';
		const DISMISS_TEXT = <i className='fas fa-times dismiss' />;

		return <Dialog className='renderWarnings' dismissKey={DISMISS_KEY} closeText={DISMISS_TEXT}>
			<i className='fas fa-exclamation-triangle ohno' />
			<h3>Render Warnings</h3>
			<small>If this homebrew is rendering badly if might be because of the following:</small>
			<ul>{_.values(this.state.warnings)}</ul>
		</Dialog>;
	}
});

module.exports = RenderWarnings;
