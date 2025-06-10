require('./menubar.less');
const React = require('react');
const { useRef, useEffect, useState, useCallback } = React;
const cx = require('classnames');
const _     = require('lodash');


const Menubar = ({ id = null, className, children })=>{
	const menubarRef = useRef(null);
	const [isCompact, setIsCompact] = useState(false);
	const fullWidthRef = useRef(null);

	useEffect(()=>{
		const menubar = menubarRef.current;
		if(!menubar) return;

		const measureFullWidth = ()=>{
			// Temporarily remove compact class to measure full width
			const wasCompact = menubar.classList.contains('compact');
			if(wasCompact) menubar.classList.remove('compact');

			// Measure full width needed
			const width = menubar.scrollWidth;
			fullWidthRef.current = width;

			// Restore compact class if it was there
			if(wasCompact) menubar.classList.add('compact');
			return width;
		};

		const checkOverflow = _.debounce(()=>{
			const containerWidth = menubar.parentElement.clientWidth;
			const fullWidth = measureFullWidth();

			setIsCompact(fullWidth > containerWidth);
		}, 100);

		// Wait for parent element to stabilize
		setTimeout(()=>{
			measureFullWidth();
			checkOverflow();

			// Set up resize observer after initial measurement
			const resizeObserver = new ResizeObserver(()=>{
				checkOverflow();
			});

			if(menubar.parentElement) {
				resizeObserver.observe(menubar.parentElement);
			}
		}, 100);

		return ()=>{
			checkOverflow.cancel();
			resizeObserver.disconnect();
		};
	}, []);

	return (
		<div
			id={id}
			ref={menubarRef}
			className={cx('menu-bar', className, { compact: isCompact })}
		>
			{children}
		</div>
	);
};



const MenuSection = ({ className, children, ...props })=>{
	const classes = cx('menu-section', className);
	return <div className={classes} {...props}>
		{children}
	</div>;
};

const MenuItem = ({ icon = null, href = null, newTab = false, onClick = null, onChange = null, color = null, className = null, children, caret = null, ...props })=>{

	const handleClick = (e)=>{
		onClick(e);
	};

	const handleChange = (e)=>{
		onChange(e);
	};

	const renderMenuItem = ()=>{
		const classes = cx('menu-item', color, className);

		icon = icon ? <i className={icon}></i> : null;

		if(href){
			return (
				<a className={classes} href={href} target={newTab ? '_blank' : '_self'} rel='noopener noreferrer'>
					{icon}
					{children && <span className='name'>{children}</span>}
				</a>
			);
		} else if(onChange) {
			return (
				<input className={classes} onChange={handleChange} {...props} />
			);
		} else if(onClick) {
			return (
				<button className={classes} onClick={handleClick} {...props}>
					{icon}
					{children && <span className='name'>{children}</span>}
				</button>
			);
		} else {
			return (
				<div className={classes} {...props}>
					{icon}
					{children && <span className='name'>{children}</span>}
				</div>
			);
		}
	};

	return renderMenuItem();
};

// this can be dramatically simplified if we just go to anchor positioning.
// remove updatePosition(), the useEffect(), the refs and the state variables.
// But also, a lot of this is unnecessary if menus are aligned to the left of a window,
// because resizing the window wouldn't change their `left/top` positions.
const MenuDropdown = ({ groupName, icon, color = null, className = null, children, disabled = false, id, customTrigger, dir = 'right', ...props })=>{
	const wrapperRef = useRef(null);
	const menuRef = useRef(null);
	const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
	const [supportsAnchorPosition, setSupportsAnchorPosition] = useState(false);
	const menuId = `${_.kebabCase(groupName)}-menu`;
	const anchorName = `--${menuId}`;

	useEffect(()=>{
		// Check for position-anchor support
		setSupportsAnchorPosition(
			CSS.supports('( position-anchor: --test  )')
		);
	}, []);

	const updatePosition = useCallback(()=>{
		if(!wrapperRef.current || !menuRef.current) return;

		// Use RAF to ensure all layout calculations are complete
		requestAnimationFrame(()=>{
			const triggerRect = wrapperRef.current.getBoundingClientRect();
			const menubarRect = wrapperRef.current.closest('.menu-bar').getBoundingClientRect();
			const isNested = wrapperRef.current.closest('.menu-list') !== null;

			setMenuPosition({
				top  : isNested ? triggerRect.height + triggerRect.y - menubarRect.height : triggerRect.height + triggerRect.y,
				left : isNested ? triggerRect.width + triggerRect.x : triggerRect.x
			});
		});
	}, []);

	useEffect(()=>{
		// Check if browser supports CSS Anchor Positioning
		if(supportsAnchorPosition) return;

		const wrapper = wrapperRef.current;
		if(!wrapper) return;

		updatePosition();

		const menubarParent = wrapper.closest('.menu-bar');
		if(!menubarParent) return;

		const resizeObserver = new ResizeObserver(updatePosition);
		resizeObserver.observe(wrapper);
		resizeObserver.observe(menubarParent);

		window.addEventListener('scroll', updatePosition, true);
		window.addEventListener('resize', updatePosition);

		return ()=>{
			resizeObserver.disconnect();
			window.removeEventListener('scroll', updatePosition, true);
			window.removeEventListener('resize', updatePosition);
		};
	}, [updatePosition]);

	// hide popover with click inside iframe (not supported by light dismiss)
	useEffect(()=>{
		const menuElement = document.getElementById(menuId);
		if(!menuElement) return;

		const handleClick = ()=>{
			if(menuElement.matches(':popover-open')) {
				menuElement.hidePopover();
			}
		};
		// Listen for clicks from both the main document and the iframe
		document.addEventListener('iframe-click', handleClick);
		return ()=>{
			document.removeEventListener('iframe-click', handleClick);
		};
	}, [menuId]);

	const trigger = (groupName)=>{
		if(!customTrigger){
			return <>
				{icon && <i className={icon} />}
				<span className='menu-name'>{groupName}</span>
				{dir && <i className={`caret fas fa-caret-${dir}`}></i>}
			</>;
		} else {
			return customTrigger;
		}
	};

	const classes = cx('menu-item', color, className);

	return (
		<div ref={wrapperRef} className='menu-wrapper' style={{ anchorName }}>
			<button className={classes} popovertarget={menuId}>
				{trigger(groupName)}
			</button>
			<div ref={menuRef}
				id={menuId}
				className='menu-list'
				popover='auto'
				style={{ positionAnchor: anchorName, ...(!supportsAnchorPosition && menuPosition) }}>
				{children}
			</div>
		</div>
	);
};

const MenuRule = ({ text = '', className, color = null })=>{
	const classes = cx('menu-hr', color, className);
	return (
		<>
			<span className={classes}>{text}<hr /></span>
		</>
	);
};

module.exports = { Menubar, MenuSection, MenuItem, MenuDropdown, MenuRule };
