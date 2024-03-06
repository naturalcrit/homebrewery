const React = require('react');
const { useState, useRef } = React;
const _ = require('lodash');
const Nav = require('naturalcrit/nav/nav.jsx');
const yaml = require('js-yaml');

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';

const NewBrew = () => {

   

    const splitTextStyleAndMetadata = (brewContent) => {
        let updatedBrew = { ...brewContent };
        updatedBrew.text = updatedBrew.text.replaceAll('\r\n', '\n');
        if (updatedBrew.text.startsWith('```metadata')) {
            const index = updatedBrew.text.indexOf('```\n\n');
            const metadataSection = updatedBrew.text.slice(12, index - 1);
            const metadata = yaml.load(metadataSection);
            updatedBrew = {
                ...updatedBrew,
                ..._.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang'])
            };
            updatedBrew.text = updatedBrew.text.slice(index + 5);
        }
        if (updatedBrew.text.startsWith('```css')) {
            const index = updatedBrew.text.indexOf('```\n\n');
            updatedBrew.style = updatedBrew.text.slice(7, index - 1);
            updatedBrew.text = updatedBrew.text.slice(index + 5);
        }
        return updatedBrew;
    };

    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                const newBrew = {
                    text: fileContent,
                    style: ''
                };
				if(fileContent.startsWith('```metadata')) {
					const updatedBrew = splitTextStyleAndMetadata(newBrew);
					localStorage.setItem(BREWKEY, updatedBrew.text);
					localStorage.setItem(STYLEKEY, updatedBrew.style);
					localStorage.setItem(METAKEY, JSON.stringify(_.pick(updatedBrew, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang'])));
					
					window.location.href = '/new';
				} else {
                    alert('This file is invalid, please, enter a valid file');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <Nav.dropdown>
            <Nav.item
                className='new'
                color='purple'
                icon='fas fa-plus-square'>
                new
            </Nav.item>
            <Nav.item
                className='fromBlank'
                href='/new'
                newTab={true}
                color='purple'
                icon='fas fa-plus-square'>
                from blank
            </Nav.item>

            <Nav.item
                className='fromFile'
                color='purple'
                icon='fas fa-plus-square'
                onClick={() => { document.getElementById('uploadTxt').click(); }}>
                <input id="uploadTxt" className='newFromLocal' type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                from file
            </Nav.item>
        </Nav.dropdown>
    );
};

module.exports = NewBrew;
