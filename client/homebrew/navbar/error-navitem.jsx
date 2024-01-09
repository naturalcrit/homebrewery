require('./error-navitem.less');
const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');
const createClass = require('create-react-class');

const translateOpts = ['nav', 'errorMsg'];

const ErrorNavItem = createClass({
	getDefaultProps : function() {
		''.setTranslationDefaults(translateOpts);
		return {
			error  : '',
			parent : null
		};
	},
	render : function() {
		const clearError = ()=>{
			const state = {
				error : null
			};
			if(this.props.parent.state.isSaving) {
				state.isSaving = false;
			}
			this.props.parent.setState(state);
		};

		const error = this.props.error;
		const response = error.response;
		const status = response.status;
		const message = response.body?.message;
		let errMsg = '';
		try {
			errMsg += `${error.toString()}\n\n`;
			errMsg += `\`\`\`\n${error.stack}\n`;
			errMsg += `${JSON.stringify(response.error, null, '  ')}\n\`\`\``;
			console.log(errMsg);
		} catch (e){}

		if(status === 409) {
			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
				{'Oops!'.translate()}
				<div className='errorContainer' onClick={clearError}>
					{message ?? 'conflict'.translate()}
				</div>
			</Nav.item>;
		} else if(status === 412) {
			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
				{'Oops!'.translate()}
				<div className='errorContainer' onClick={clearError}>
					{message ?? 'outOfDate'.translate()}
				</div>
			</Nav.item>;
		}

		if(response.req.url.match(/^\/api.*Google.*$/m)){
			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
				{'Oops!'.translate()}
				<div className='errorContainer' onClick={clearError}>
					{'expiredCredentials'.translate()}
					<a target='_blank' rel='noopener noreferrer'
						href={`https://www.naturalcrit.com/login?redirect=${window.location.href}`}>
						<div className='confirm'>
							{'sign in'.translate()}
						</div>
					</a>
					<div className='deny'>
						{'not now'.translate()}
					</div>
				</div>
			</Nav.item>;
		}

		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			{'Oops!'.translate()}
			<div className='errorContainer'>
				{'problemSaving'.translate()}<a target='_blank' rel='noopener noreferrer' href={`https://github.com/naturalcrit/homebrewery/issues/new?template=save_issue.yml&error-code=${encodeURIComponent(errMsg)}`}>
				{'here'.translate()}
				</a>.
			</div>
		</Nav.item>;
	}
});

module.exports = ErrorNavItem;
