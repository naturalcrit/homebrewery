const React  = require('react');
const moment = require('moment');
const UIPage = require('../basePages/uiPage/uiPage.jsx');
const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

let SAVEKEY = '';
const SIZEKEY = 'HOMEBREWERY-DEFAULT-SIZE';

const AccountPage = (props)=>{
	// destructure props and set state for save location
	const { accountDetails, brew } = props;
	const [saveLocation, setSaveLocation] = React.useState('');
	const [pageSize, setPageSize] = React.useState('');

	// initialize save location from local storage based on user id
	React.useEffect(()=>{
		if(!saveLocation && accountDetails.username) {
			SAVEKEY = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${accountDetails.username}`;
			// if no SAVEKEY in local storage, default save location to Google Drive if user has Google account.
			let saveLocation = window.localStorage.getItem(SAVEKEY);
			saveLocation = saveLocation ?? (accountDetails.googleId ? 'GOOGLE-DRIVE' : 'HOMEBREWERY');
			setActiveSaveLocation(saveLocation);
		}
		if(!pageSize) {
			setPageSize(window.localStorage.getItem(SIZEKEY) ?? 'letter'); 
		}
	}, []);

	const setActiveSaveLocation = (newSelection)=>{
		if(saveLocation === newSelection) return;
		window.localStorage.setItem(SAVEKEY, newSelection);
		setSaveLocation(newSelection);
	};

	// todo: should this be a set of radio buttons (well styled) since it's either/or choice?
	const renderSaveLocationButton = (name, key, shouldRender = true)=>{
		if(!shouldRender) return null;
		return (
			<button className={saveLocation === key ? 'active' : ''} onClick={()=>{setActiveSaveLocation(key);}}>
				{name}
			</button>
		);
	};

	const setActivePageSize = (size) => {
		if (typeof window !== 'undefined' && window.localStorage) {
			window.localStorage.setItem(SIZEKEY, size);
			setPageSize(size);
		}
	}

	const renderDefaultPageSizeOptions = () => {
	
		return (
			<div className='pageSize'>
				<h5>Default Page Size: </h5>
				<label>Letter:<input type="radio" name="size" id="letterSize" onChange={() => setActivePageSize('letter')} defaultChecked={pageSize === 'letter'}/></label>
				<label>A4:<input type="radio" name="size" id="A4Size" onChange={() => setActivePageSize('A4')} defaultChecked={pageSize === 'A4'}/></label>
			</div>
		);
	};
	
	// render the entirety of the account page content
	const renderAccountPage = ()=>{
		return (
			<>
				<div className='dataGroup'>
					<h1>Account Information <i className='fas fa-user'></i></h1>
					<p><strong>Username: </strong>{accountDetails.username || 'No user currently logged in'}</p>
					<p><strong>Last Login: </strong>{moment(accountDetails.issued).format('dddd, MMMM Do YYYY, h:mm:ss a ZZ') || '-'}</p>
				</div>
				<div className='dataGroup'>
					<h3>Homebrewery Information <NaturalCritIcon /></h3>
					<p><strong>Brews on Homebrewery: </strong>{accountDetails.mongoCount}</p>
				</div>
				<div className='dataGroup'>
					<h3>Google Information <i className='fab fa-google-drive'></i></h3>
					<p><strong>Linked to Google: </strong>{accountDetails.googleId ? 'YES' : 'NO'}</p>
					{accountDetails.googleId && (
						<p>
							<strong>Brews on Google Drive: </strong>{accountDetails.googleCount ?? (
								<>
									Unable to retrieve files - <a href='https://github.com/naturalcrit/homebrewery/discussions/1580'>follow these steps to renew your Google credentials.</a>
								</>
							)}
						</p>
					)}
				</div>
				<div className='dataGroup'>
					<h4>Default Save Location</h4>
					{renderSaveLocationButton('Homebrewery', 'HOMEBREWERY')}
					{renderSaveLocationButton('Google Drive', 'GOOGLE-DRIVE', accountDetails.googleId)}
				</div>
				<div className="dataGroup">
					<h4>Brew Defaults</h4>
					{renderDefaultPageSizeOptions()}
					{/*renderDefaultThemeUrl()*/}
				</div>
			</>
		);
	};

	// return the account page inside the base layout wrapper (with navbar etc).
	return (
		<UIPage brew={brew}>
			{renderAccountPage()}
		</UIPage>);
};

module.exports = AccountPage;
