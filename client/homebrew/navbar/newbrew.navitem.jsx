const React = require('react');
const _ = require('lodash');
const Nav = require('client/homebrew/navbar/nav.jsx');
const { splitTextStyleAndMetadata } = require('../../../shared/helpers.js'); // Importing the function from helpers.js

const BREWKEY  = 'HB_newPage_content';
const STYLEKEY = 'HB_newPage_style';
const METAKEY = 'HB_newPage_meta';

const NewBrew = ()=>{
	const handleFileChange = (e)=>{
		const file = e.target.files[0];
		if(!file) return;

		if(!confirmLocalStorageChange()) return;

		const reader = new FileReader();
		reader.onload = (e)=>{
			const fileContent = e.target.result;
			const newBrew = { text: fileContent, style: '' };

			if(fileContent.startsWith('```metadata')) {
				splitTextStyleAndMetadata(newBrew);
				localStorage.setItem(BREWKEY, newBrew.text);
				localStorage.setItem(STYLEKEY, newBrew.style);
				localStorage.setItem(METAKEY, JSON.stringify(
					_.pick(newBrew, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang'])
				));
				window.location.href = '/new';
				return;
			}

			const type = file.name.split('.').pop().toLowerCase();

			alert(`This file is invalid: ${!type ? 'Missing file extension' :`.${type} files are not supported`}. Only .txt files exported from the Homebrewery are allowed.`);

			console.log(file);
		};
		reader.readAsText(file);
	};

	const confirmLocalStorageChange = ()=>{
		const currentText  = localStorage.getItem(BREWKEY);
		const currentStyle = localStorage.getItem(STYLEKEY);
		const currentMeta  = localStorage.getItem(METAKEY);

		// TRUE if no data in any local storage key
		// TRUE if data in any local storage key AND approval given
		// FALSE if data in any local storage key AND approval declined
		return (!(currentText || currentStyle || currentMeta) || confirm(
			`You have made changes in the new brew space. If you continue, that information will be PERMANENTLY LOST.\nAre you sure you wish to continue?`
		));
	};

	const clearLocalStorage = ()=>{
		if(!confirmLocalStorageChange()) return;

		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);

		window.location.href = '/new';
		return;
	};


	return (
		<Nav.dropdown>
			<Nav.item
				className='new'
				color='purple'
				icon='fa-solid fa-plus-square'>
					new
			</Nav.item>
			<Nav.item
				className='new'
				href='/new'
				newTab={true}
				color='purple'
				icon='fa-solid fa-file'>
					resume draft
			</Nav.item>
			<Nav.item
				className='fromBlank'
				newTab={true}
				color='yellow'
				icon='fa-solid fa-file-circle-plus'
				onClick={()=>{ clearLocalStorage(); }}>
					from blank
			</Nav.item>
			<Nav.item
				className='fromFile'
				color='green'
				icon='fa-solid fa-upload'
				onClick={()=>{ document.getElementById('uploadTxt').click(); }}>
				<input id='uploadTxt' className='newFromLocal' type='file' onChange={handleFileChange} style={{ display: 'none' }} />
					from file
			</Nav.item>
		</Nav.dropdown>
	);
};

module.exports = NewBrew;
