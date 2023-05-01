require('./navbar.less');
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Portal from '@radix-ui/react-portal';
const React = require('react');
const createClass = require('create-react-class');

const NaturalCritIcon = require('shared/naturalcrit/svg/naturalcrit.svg.jsx');

const Navbar = {

	Top : createClass({
		displayName : 'Nav.Top',

		getInitialState : function() {
			return {
				ver : global.version
			};
		},

		renderSitewideLinks : function() {
			return <>
				<Toolbar.Link href='https://www.naturalcrit.com/'>NaturalCrit</Toolbar.Link>
				<Toolbar.Link href='/'>The Homebrewery</Toolbar.Link>
				<Toolbar.Link href='/changelog'>{`v${this.state.ver}`}</Toolbar.Link>
				<Toolbar.Link href='https://www.patreon.com/NaturalCrit'>Patreon</Toolbar.Link>
			</>;
		},

		render : function(){
			return <Toolbar.Root id='top-toolbar' className='toolbar'>
				{this.renderSitewideLinks()}
				{this.props.children}
				<NaturalCritIcon />
			</Toolbar.Root>;
		}
	}),

	Bottom : createClass({
		displayName : 'Nav.Bottom',

		render : function(){
			return <Toolbar.Root id='bottom-toolbar' className='toolbar'>
				{this.props.children}
			</Toolbar.Root>;
		}
	})


};


module.exports = Navbar;
