const React = require('react');
const moment = require('moment');

const UIPage = require('../basePages/uiPage/uiPage.jsx');

const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

let SAVEKEY = '';

const AccountPage = (props)=>{
	const [saveLocation, setSaveLocation] = React.useState('');

	React.useEffect(()=>{
		if(!saveLocation && props.uiItems.username) {
			SAVEKEY = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${props.uiItems.username}`;
			let saveLocation = window.localStorage.getItem(SAVEKEY);
			saveLocation = saveLocation ?? (props.uiItems.googleId ? 'GOOGLE-DRIVE' : 'HOMEBREWERY');
			makeActive(saveLocation);
		}
	}, []);

	const makeActive = (newSelection)=>{
		if(saveLocation === newSelection) return;
		window.localStorage.setItem(SAVEKEY, newSelection);
		setSaveLocation(newSelection);
	};

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

	const renderUiItems = ()=>{
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

	return (
		<UIPage brew={props.brew}>
			{renderUiItems()}
		</UIPage>);
};

module.exports = AccountPage;
