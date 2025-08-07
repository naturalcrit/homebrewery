require('./error-navitem.less');
const React = require('react');
import { MenuItem } from '../../components/menubar/Menubar.jsx';
const createClass = require('create-react-class');

const ErrorMenuItem = createClass({
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
		const status      = response?.status;
		const errorCode   = error.code
		const HBErrorCode = response?.body?.HBErrorCode;
		const message     = response?.body?.message;
		let errMsg = '';
		try {
			errMsg += `${error.toString()}\n\n`;
			errMsg += `\`\`\`\n${error.stack}\n`;
			errMsg += `${JSON.stringify(response?.error, null, '  ')}\n\`\`\``;
			console.log(errMsg);
		} catch (e){}

		if(status === 409) {
			return <MenuItem className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer' onClick={clearError}>
					{message ?? 'Conflict: please refresh to get latest changes'}
				</div>
			</MenuItem>;
		}

		if(status === 412) {
			return <MenuItem className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer' onClick={clearError}>
					{message ?? 'Your client is out of date. Please save your changes elsewhere and refresh.'}
				</div>
			</MenuItem>;
		}

		if(HBErrorCode === '04') {
			return <MenuItem className='save error' icon='fas fa-exclamation-triangle'>
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
			</MenuItem>;
		}

		if(response?.body?.errors?.[0].reason == 'storageQuotaExceeded') {
			return <MenuItem className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
				<div className='errorContainer' onClick={clearError}>
				Can't save because your Google Drive seems to be full!
				</div>
			</MenuItem>;
		}

		if(response?.req.url.match(/^\/api.*Google.*$/m)){
			return <MenuItem className='save error' icon='fas fa-exclamation-triangle'>
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
			</MenuItem>;
		}

		if(HBErrorCode === '09') {
			return <MenuItem className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer' onClick={clearError}>
					Looks like there was a problem retreiving
					the theme, or a theme that it inherits,
					for this brew. Verify that brew <a className='lowercase' target='_blank' rel='noopener noreferrer' href={`/share/${response.body.brewId}`}>
						{response.body.brewId}</a> still exists!
				</div>
			</MenuItem>;
		}

		if(HBErrorCode === '10') {
			return <MenuItem className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer' onClick={clearError}>
					Looks like the brew you have selected
					as a theme is not tagged for use as a
					theme. Verify that
					brew <a className='lowercase' target='_blank' rel='noopener noreferrer' href={`/share/${response.body.brewId}`}>
						{response.body.brewId}</a> has the <span className='lowercase'>meta:theme</span> tag!
				</div>
			</MenuItem>;
		}

		if(errorCode === 'ECONNABORTED') {
			return <MenuItem className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer' onClick={clearError}>
					The request to the server was interrupted or timed out.
					This can happen due to a network issue, or if
					trying to save a particularly large brew.
					Please check your internet connection and try again.
				</div>
			</MenuItem>;
		}

		return <MenuItem className='save error' icon='fas fa-exclamation-triangle'>
			Oops!
			<div className='errorContainer'>
				Looks like there was a problem saving. <br />
				Report the issue <a target='_blank' rel='noopener noreferrer' href={`https://github.com/naturalcrit/homebrewery/issues/new?template=save_issue.yml&error-code=${encodeURIComponent(errMsg)}`}>
				here
				</a>.
			</div>
		</MenuItem>;
	}
});

module.exports = ErrorMenuItem;
