require('./errorPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const UIPage = require('../basePages/uiPage/uiPage.jsx');

const Markdown = require('../../../../shared/naturalcrit/markdown.js');

const ErrorIndex = require('./errors/errorIndex.json');

const ErrorPage = createClass({
	displayName : 'ErrorPage',

	getDefaultProps : function() {
		return {
			ver     : '0.0.0',
			errorId : '',
			text    : '# Oops \n We could not find a brew with that id. **Sorry!**',
			error   : {}
		};
	},

	render : function(){
		const errorText = ErrorIndex[this.props.brew.status.toString()] || '';

		return <UIPage brew={{ title: 'Crit Fail!' }}>
			<h1>{`Error ${this.props.brew.status || '000'}`}</h1>
			<p>{this.props.brew.text || 'No error text'}</p>
			<hr />
			<div dangerouslySetInnerHTML={{ __html: Markdown.render(errorText) }} />
		</UIPage>;
	}
});

module.exports = ErrorPage;
