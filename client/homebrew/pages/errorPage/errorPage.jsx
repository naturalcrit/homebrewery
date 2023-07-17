require('./errorPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const UIPage = require('../basePages/uiPage/uiPage.jsx');

const Markdown = require('../../../../shared/naturalcrit/markdown.js');

const ErrorIndex = require('./errors/errorIndex.js');

const ErrorPage = createClass({
	displayName : 'ErrorPage',

	getDefaultProps : function() {
		return {
			ver     : '0.0.0',
			errorId : '',
			text    : '# Oops \n Ich habe alles durchsucht, ein Gebräu mit dieser ID konnte ich nicht finden. **Sorry!**',
			error   : {}
		};
	},

	render : function(){
		const errorText = ErrorIndex(this.props)[this.props.brew.HBErrorCode.toString()] || '';

		return <UIPage brew={{ title: 'Crit Fail!' }}>
			<div className='dataGroup'>
				<div className='errorTitle'>
					<h1>{`Fehler ${this.props.brew.status || '000'}`}</h1>
					<h4>{this.props.brew.text || 'Keine Ahnung was das Problem ist.'}</h4>
				</div>
				<hr />
				<div dangerouslySetInnerHTML={{ __html: Markdown.render(errorText) }} />
				<img className="baromna" src="/assets/ilaris/lebewesen/baromna.png"></img>
			</div>
		</UIPage>;
	}
});

module.exports = ErrorPage;
