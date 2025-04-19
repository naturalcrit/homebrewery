const React = require('react');

const NavbarContext = React.createContext(null);

const NavbarProvider = ({ children })=>{
	const [openMenus, setOpenMenus] = React.useState(new Set());

	const isMenuOpen = (id)=>openMenus.has(id);

	const openMenu = (id)=>{
		setOpenMenus((prev)=>new Set(prev).add(id));
	};

	const closeMenu = (id)=>{
		setOpenMenus((prev)=>{
			const next = new Set(prev);
			next.delete(id);
			return next;
		});
	};

	const closeAllMenus = ()=>{
		setOpenMenus(new Set());
	};

	return (
		<NavbarContext.Provider value={{
			openMenus,
			isMenuOpen,
			openMenu,
			closeMenu,
			closeAllMenus
		}}>
			{children}
		</NavbarContext.Provider>
	);
};

module.exports = { NavbarContext, NavbarProvider };