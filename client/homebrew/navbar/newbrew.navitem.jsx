const React = require('react');
const _ = require('lodash');
const Nav = require('naturalcrit/nav/nav.jsx');
const { splitTextStyleAndMetadata } = require('../../../shared/helpers.js'); // Importing the function from helpers.js

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY = 'homebrewery-new-meta';

const NewBrew = ()=>{
	const handleFileChange = (e)=>{
		const file = e.target.files[0];
		if(!file) return;

		const currentNew = localStorage.getItem(BREWKEY);
		if(currentNew && !confirm(
			`You have some text in the new brew space, if you load a file that text will be lost, are you sure you want to load the file?`
		)) return;

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
			
			alert(`This file is invalid: ${!type ? "Missing file extension" :`.${type} files are not supported`}. Only .txt files exported from the Homebrewery are allowed.`);


			console.log(file);
		};
		reader.readAsText(file);
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
				className='fromBlank'
				href='/new'
				newTab={true}
				color='purple'
				icon='fa-solid fa-file'>
                from blank
			</Nav.item>

			<Nav.item
				className='fromFile'
				color='purple'
				icon='fa-solid fa-upload'
				onClick={()=>{ document.getElementById('uploadTxt').click(); }}>
				<input id='uploadTxt' className='newFromLocal' type='file' onChange={handleFileChange} style={{ display: 'none' }} />
                from file
			</Nav.item>
		</Nav.dropdown>
	);
};

module.exports = NewBrew;
