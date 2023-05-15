require('./navbar.less');
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Menubar from '@radix-ui/react-menubar';
import * as Portal from '@radix-ui/react-portal';
import { LinkItem, ButtonItem } from './menubarExtensions.jsx';
const React = require('react');
const createClass = require('create-react-class');
import classNames from 'classnames';


const NaturalCritIcon = require('shared/naturalcrit/svg/naturalcrit.svg.jsx');

const MainMenu = {

	Top : createClass({
		displayName : 'MainMenu.Top',

		getInitialState : function() {
			return {
				ver : global.version
			};
		},

		renderAboutMenu : function() {
			return <Menubar.Menu className='menu'>
				<Menubar.Trigger className='trigger'><NaturalCritIcon /></Menubar.Trigger>
				<Menubar.Portal>
					<Menubar.Content className='menu-content' loop>
						<div className='about'>
							<div className='hb-heading'>The Homebrewery</div>
							<div className='naturalcrit-subheading'>By NaturalCrit</div>
						</div>
						<LinkItem href='/changelog'>{`v${this.state.ver}`}</LinkItem>
						<LinkItem href='https://github.com/naturalcrit/homebrewery'>Github</LinkItem>
						<LinkItem href='https://www.patreon.com/NaturalCrit'>Patreon</LinkItem>
						<LinkItem href='https://www.naturalcrit.com/'>NaturalCrit.com</LinkItem>
					</Menubar.Content>
				</Menubar.Portal>
			</Menubar.Menu>;
		},

		render : function(){
			return <Menubar.Root id='top-menubar' className='menubar'>
				{this.renderAboutMenu()}
				{this.props.children}
			</Menubar.Root>;
		}
	}),

	Bottom : createClass({
		displayName : 'MainMenu.Bottom',

		render : function(){
			return <Menubar.Root id='bottom-menubar' className='menubar'>
				{this.props.children}
			</Menubar.Root>;
		}
	})


};


module.exports = MainMenu;
