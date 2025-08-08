const React = require('react');
const _ = require('lodash');
const {MenuItem, MenuDropdown} = require('../../components/menubar/Menubar.jsx');
const { splitTextStyleAndMetadata } = require('../../../shared/helpers.js'); // Importing the function from helpers.js
import { saveBrew } from 'client/homebrew/utils/save.js';

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';

const NewBrew = ({...props})=>{
	const handleFileChange = (e)=>{
		const file = e.target.files[0];
		if(file) {
			const reader = new FileReader();
			reader.onload = (e)=>{
				const fileContent = e.target.result;
				const newBrew = {
					text  : fileContent,
					style : ''
				};
				if(fileContent.startsWith('```metadata')) {
					splitTextStyleAndMetadata(newBrew); // Modify newBrew directly
					localStorage.setItem(BREWKEY, newBrew.text);
					localStorage.setItem(STYLEKEY, newBrew.style);
					localStorage.setItem(METAKEY, JSON.stringify(_.pick(newBrew, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang'])));
					window.location.href = '/new';
				} else {
					alert('This file is invalid, please, enter a valid file');
				}
			};
			reader.readAsText(file);
		}
	};

	return (
		<MenuDropdown id='newBrewMenu'
			groupName='New'
			color={props.disabled ? 'grey' : 'green'}
			icon='fa-solid fa-plus-square'
			caret={true}>
			<MenuItem
				className='fromBlank'
				href='/new'
				newTab={true}
				color='green'
				icon='fa-solid fa-file'>
                from blank
			</MenuItem>

			<MenuItem
				className='fromFile'
				color='green'
				icon='fa-solid fa-upload'
				onClick={()=>{ document.getElementById('uploadTxt').click(); }}>
				<input id='uploadTxt' className='newFromLocal' type='file' onChange={handleFileChange} style={{ display: 'none' }} />
                from file
			</MenuItem>
		</MenuDropdown>
	);
};

module.exports = NewBrew;
