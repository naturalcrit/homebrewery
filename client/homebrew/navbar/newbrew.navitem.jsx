const React = require('react');
const _ = require('lodash');
const Nav = require('naturalcrit/nav/nav.jsx');
const yaml = require('js-yaml');
const { useRef } = React;

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';

const splitTextStyleAndMetadata = (brew)=>{
	brew.text = brew.text.replaceAll('\r\n', '\n');
	if(brew.text.startsWith('```metadata')) {
		const index = brew.text.indexOf('```\n\n');
		const metadataSection = brew.text.slice(12, index - 1);
		const metadata = yaml.load(metadataSection);
		Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang']));
		brew.text = brew.text.slice(index + 5);
	}
	if(brew.text.startsWith('```css')) {
		const index = brew.text.indexOf('```\n\n');
		brew.style = brew.text.slice(7, index - 1);
		brew.text = brew.text.slice(index + 5);
	}
};


const handleFileChange = (e) => {
	const file = e.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const fileContent = e.target.result;
			
			const brew = {
				text  :fileContent,
				style : ''
			}
			splitTextStyleAndMetadata(brew);
			console.log(brew);
			localStorage.setItem(BREWKEY, brew.text);
			localStorage.setItem(STYLEKEY, brew.style);
			localStorage.setItem(METAKEY, JSON.stringify({
				'title': brew.title,
				'description': brew.description,
				'tags': brew.tags,
				'systems': brew.systems,
				'renderer': brew.renderer,
				'theme': brew.theme,
				'lang': brew.lang
			}));

			//window.location.href = '/new';
		};
		reader.readAsText(file);
	}
};


module.exports = function(props){
	const inputRef = useRef(null);

	return <Nav.dropdown>
		<Nav.item
			className='new'
			color='purple'
			icon='fas fa-plus-square'>
			new
		</Nav.item>
		<Nav.item
			href='/new'
			newTab={true}
			color='purple'
			icon='fas fa-plus-square'>
			new
		</Nav.item>
		
		<Nav.item
            color='purple'
            icon='fas fa-plus-square'
			onClick={() => { inputRef.current.click(); }}>
            <input className='newFromLocal' type="file" ref={inputRef} onChange={handleFileChange}  style={{ display: 'none' }}/>
            New From Local File
        </Nav.item>

	</Nav.dropdown>;
	
};

/*
<Nav.item
			href={'/new/'+encodeURIComponent(brewID)}
			newTab={true}
			color='purple'
			icon='fas fa-plus-square'>
			new cloned
		</Nav.item>
*/