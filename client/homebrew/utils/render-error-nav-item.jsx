require('./render-error-nav-item.less');
const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(component, error){
	const clearError = ()=>{
		const state = {
			error : null
		};
		if(component.state.isSaving) {
			state.isSaving = false;
		}
		component.setState(state);
	};

	const status = error.status;
	const message = error.body?.message;
	let errMsg = '';
	try {
		errMsg += `${error.toString()}\n\n`;
		errMsg += `\`\`\`\n${error.stack}\n`;
		errMsg += `${JSON.stringify(error.error, null, '  ')}\n\`\`\``;
		console.log(errMsg);
	} catch (e){}

	if(status === 409) {
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
            Oops!
			<div className='errorContainer' onClick={clearError}>
				{message ?? 'Conflict: please refresh to get latest changes'}
			</div>
		</Nav.item>;
	} else if(status === 412) {
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
            Oops!
			<div className='errorContainer' onClick={clearError}>
				{message ?? 'Your client is out of date. Please save your changes elsewhere and refresh.'}
			</div>
		</Nav.item>;
	}

	if(error.req.url.match(/^\/api.*Google.*$/m)){
		return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
            Oops!
			<div className='errorContainer' onClick={clearError}>
                Looks like your Google credentials have
                expired! Visit our log in page to sign out
                and sign back in with Google,
                then try saving again!
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
};