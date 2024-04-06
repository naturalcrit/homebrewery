const React = require('react');
const moment = require('moment');

const UIPage = require('../basePages/uiPage/uiPage.jsx');

const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

let SAVEKEY = '';

const AccountPage = (props)=>{
	// State for the save location
	const [saveLocation, setSaveLocation] = React.useState('');

	// initialize save location from local storage based on user id
	React.useEffect(()=>{
		if(!saveLocation && props.uiItems.username) {
			SAVEKEY = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${props.uiItems.username}`;
			// if no SAVEKEY in local storage, default save location to Google Drive.
			let saveLocation = window.localStorage.getItem(SAVEKEY);
			saveLocation = saveLocation ?? (props.uiItems.googleId ? 'GOOGLE-DRIVE' : 'HOMEBREWERY');
			makeActive(saveLocation);
		}
	}, []);

	// function to set the active save location
	const makeActive = (newSelection)=>{
		if(saveLocation === newSelection) return;
		window.localStorage.setItem(SAVEKEY, newSelection);
		setSaveLocation(newSelection);
	};

	// render a button for setting save locations. 
	// todo: should this be a set of radio buttons (well styled) since it's either/or choice?
	const renderButton = (name, key, shouldRender = true)=>{
		if(!shouldRender) return null;
		return (
			<button
				className={saveLocation === key ? 'active' : ''}
				onClick={()=>{
					makeActive(key);
				}}
			>
				{name}
			</button>
		);
	};

	// render the entirety of the account page content
	const renderAccountPage = ()=>{
		return (
			<>
				<div className='dataGroup'>
					<h1>Account Information <i className='fas fa-user'></i></h1>
					<p><strong>Username: </strong>{props.uiItems.username || 'No user currently logged in'}</p>
					<p><strong>Last Login: </strong>{moment(props.uiItems.issued).format('dddd, MMMM Do YYYY, h:mm:ss a ZZ') || '-'}</p>
				</div>
				<div className='dataGroup'>
					<h3>Homebrewery Information <NaturalCritIcon /></h3>
					<p><strong>Brews on Homebrewery: </strong>{props.uiItems.mongoCount}</p>
				</div>
				<div className='dataGroup'>
					<h3>Google Information <i className='fab fa-google-drive'></i></h3>
					<p><strong>Linked to Google: </strong>{props.uiItems.googleId ? 'YES' : 'NO'}</p>
					{props.uiItems.googleId && (
						<p>
							<strong>Brews on Google Drive: </strong>{props.uiItems.googleCount ?? (
								<>
									Unable to retrieve files - <a href='https://github.com/naturalcrit/homebrewery/discussions/1580'>follow these steps to renew your Google credentials.</a>
								</>
							)}
						</p>
					)}
				</div>
				<div className='dataGroup'>
					<h4>Default Save Location</h4>
					{renderButton('Homebrewery', 'HOMEBREWERY')}
					{renderButton('Google Drive', 'GOOGLE-DRIVE', props.uiItems.googleId)}
				</div>
			</>
		);
	};

	// return the account page inside the base layout wrapper (with navbar etc).
	return (
		<UIPage brew={props.brew}>
			{renderAccountPage()}
		</UIPage>);
};

module.exports = AccountPage;
