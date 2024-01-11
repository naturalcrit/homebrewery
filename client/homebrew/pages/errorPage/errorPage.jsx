require('./errorPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const UIPage = require('../basePages/uiPage/uiPage.jsx');

const Markdown = require('../../../../shared/naturalcrit/markdown.js');

const translateOpts = ['errorCodes'];
const ErrorIndex = require('./errors/errorIndex.js');


const ErrorPage = createClass({
	displayName : 'ErrorPage',

	getDefaultProps : function() {
		return {
			ver     : '0.0.0',
			errorId : '',
			text    : 'Oops'.translate(),
			error   : {}
		};
	},

	render : function(){
		''.setTranslationDefaults(translateOpts);
		const errorText = ErrorIndex(this.props)[this.props.brew.HBErrorCode.toString()] || '';

		return <UIPage brew={{ title: 'Crit Fail!'.translate() }}>
			<div className='dataGroup'>
				<div className='errorTitle'>
					<h1>{`${'Error'.translate()} ${this.props.brew.status || '000'}`}</h1>
					<h4>{this.props.brew.text || 'No error text'.translate()}</h4>
				</div>
				<hr />
				<div dangerouslySetInnerHTML={{ __html: Markdown.render(errorText) }} />
			</div>
		</UIPage>;
	}
});

module.exports = ErrorPage;
