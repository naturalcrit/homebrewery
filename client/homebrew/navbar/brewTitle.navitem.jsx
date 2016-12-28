const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');
const Store = require('homebrewery/brew.store.js');

module.exports = Store.createSmartComponent((props) => {
	return <Nav.item className='brewTitle'>{props.title}</Nav.item>
}, (props) => {
	return {title : Store.getMetaData().title};
})