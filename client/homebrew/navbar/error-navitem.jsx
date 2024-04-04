require('./error-navitem.less');
const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');
const createClass = require('create-react-class');

const ErrorNavItem = createClass({
	getDefaultProps : function() {
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

		const error       = this.props.error;
		const response    = error.response;
		const status      = response.status;
		const HBErrorCode = response.body?.HBErrorCode;
		const message     = response.body?.message;
		let errMsg = '';
		try {
			errMsg += `${error.toString()}\n\n`;
			errMsg += `\`\`\`\n${error.stack}\n`;
			errMsg += `${JSON.stringify(response.error, null, '  ')}\n\`\`\``;
			console.log(errMsg);
		} catch (e){}

		if(status === 409) {
			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer' onClick={clearError}>
					{message ?? 'Conflict: please refresh to get latest changes'}
				</div>
			</Nav.item>;
		}
		
		if(status === 412) {
			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer' onClick={clearError}>
					{message ?? 'Your client is out of date. Please save your changes elsewhere and refresh.'}
				</div>
			</Nav.item>;
		}
		
		if(HBErrorCode === '04') {
			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer' onClick={clearError}>
					You are no longer signed in as an author of
					this brew! Were you signed out from a different
					window? Visit our log in page, then try again!
					<br></br>
					<a target='_blank' rel='noopener noreferrer'
						href={`https://www.naturalcrit.com/login?redirect=${window.location.href}`}>
						<div className='confirm'>
							Sign In
						</div>
					</a>
					<div className='deny'>
						Not Now
					</div>
				</div>
			</Nav.item>;
		}

		if(response.body?.errors?.[0].reason == 'storageQuotaExceeded') {
			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer' onClick={clearError}>
				Can't save because your Google Drive seems to be full!
			</div>
		</Nav.item>;
		}

		if(response.req.url.match(/^\/api.*Google.*$/m)){
			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer' onClick={clearError}>
					Looks like your Google credentials have
					expired! Visit our log in page to sign out
					and sign back in with Google,
					then try saving again!
					<br></br>
					<a target='_blank' rel='noopener noreferrer'
						href={`https://www.naturalcrit.com/login?redirect=${window.location.href}`}>
						<div className='confirm'>
							Sign In
						</div>
					</a>
					<div className='deny'>
						Not Now
					</div>
				</div>
			</Nav.item>;
		}

		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer'>
				Looks like there was a problem saving. <br />
				Report the issue <a target='_blank' rel='noopener noreferrer' href={`https://github.com/naturalcrit/homebrewery/issues/new?template=save_issue.yml&error-code=${encodeURIComponent(errMsg)}`}>
				here
				</a>.
			</div>
		</Nav.item>;
	}
});

module.exports = ErrorNavItem;
