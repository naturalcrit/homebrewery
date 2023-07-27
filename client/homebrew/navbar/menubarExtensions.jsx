const React = require('react');
const createClass = require('create-react-class');
import * as MenubarPrimitive from '@radix-ui/react-menubar';

const renderHotkeys = function(hotkeysObject) {
	if(!hotkeysObject) return;
	const keyArray = global.device.os == 'mac' ? hotkeysObject.mac : hotkeysObject.pc;
	const hotkeySpans = keyArray.map((key, i)=>{
		return <span key={i} className='key'>{key}</span>;
	});
	return (
		<span className='right-slot'>{hotkeySpans}</span>
	);
};

const LinkItem = React.forwardRef(({ hotkeys, children, href, ...props }, forwardedRef)=>(
	<MenubarPrimitive.Item asChild>
		<a href={href} {...props} ref={forwardedRef}>{children}{renderHotkeys(hotkeys)}</a>
	</MenubarPrimitive.Item>
));
LinkItem.displayName = 'LinkItem';

const ButtonItem = React.forwardRef(({ hotkeys, children, ...props }, forwardedRef)=>(
	<MenubarPrimitive.Item {...props} ref={forwardedRef}>{children}{renderHotkeys(hotkeys)}</MenubarPrimitive.Item>
));
ButtonItem.displayName = 'ButtonItem';


const Menu = createClass({
	displayName     : 'Menu',
	getDefaultProps : function(){
		return {
			trigger : '',
		};
	},

	render : function(){
		return <MenubarPrimitive.Menu>
			<MenubarPrimitive.Trigger className={this.props.className}>{this.props.trigger}</MenubarPrimitive.Trigger>
			<MenubarPrimitive.Portal>
				<MenubarPrimitive.Content className={`${this.props.className} menu-content`}>
					{this.props.children}
				</MenubarPrimitive.Content>
			</MenubarPrimitive.Portal>
		</MenubarPrimitive.Menu>;
	}
});

const SubMenu = createClass({
	displayName     : 'SubMenu',
	getDefaultProps : function(){
		return {
			trigger : '',
		};
	},

	render : function(){
		return <MenubarPrimitive.Sub>
			<MenubarPrimitive.SubTrigger>{this.props.trigger}<span className='right-slot'><i className='fas fa-chevron-right'></i></span></MenubarPrimitive.SubTrigger>
			<MenubarPrimitive.Portal>
				<MenubarPrimitive.SubContent className={`${this.props.className} menu-content sub-menu`}>
					{this.props.children}
				</MenubarPrimitive.SubContent>
			</MenubarPrimitive.Portal>
		</MenubarPrimitive.Sub>;
	}
});

module.exports = { LinkItem, ButtonItem, Menu, SubMenu };