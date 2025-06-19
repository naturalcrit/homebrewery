import React, { useRef } from 'react';

const Button = ({
	id,
	className,
	icon,
	tooltipDirection = ['down'],
	compact = undefined,
	children,
	isMenu = false,
	iconOnly = undefined,
	...props
})=>{

	const anchorName = `--${id}`;
	const popoverRef = useRef(null);

	const dir = ()=>{
		if(tooltipDirection[0] == 'down'){
			return {
				top          : '5px',
				positionArea : 'bottom',
				positionTryFallbacks : 'bottom span-right'
			};
		} else if(tooltipDirection[0] == 'right'){
			return {
				positionArea : 'right',
				left         : '5px'
			};
		}
	};

	const style = {
		position      : 'fixed',
		height        : 'max-content',
		width         : 'max-content',
		background    : '#888',
		borderRadius  : '3px',
		padding       : '3px',
		textTransform : 'uppercase',
		fontSize      : '13px',
		fontWeight    : 600,
		fontFamily    : 'open sans',
		color         : 'inherit',
		...dir()
	};

	// This component uses a ref + the popover apis, rather than just react state + conditional rendering of the element,
	// because the popover api can utilize the "#top layer" of the DOM as the element container.
	// This not for no reason:  with the new `filter:drop-shadow()` css property on the splitPane divider
	// anchor positioning doesn't work as expected.  The filter property creates a new positioning context
	// relative to that element.  Putting the popover in the "top layer" escapes this context.
	// An alternative would be to use React Portals to essentially do the same thing, attaching the tooltip
	// to the `body` element or similar ancestor.


	// This popover enables a tooltip when the icon is hovered (if it's in "compact" mode), which currently requires JS
	// to work.  But the Chrome team has something in the pipeline, `interesttarget`, that would make hovering behavior
	// an HTML-only thing: https://developer.chrome.com/blog/popover-hint#hover_triggering

	const hideTooltip = ()=>{popoverRef.current.hidePopover();};
	const showTooltip = ()=>{popoverRef.current.showPopover();};

	if(compact === true || iconOnly == true){
		return (
			<>
				<button id={id} className={`${className} compact`} style={{ anchorName }} onMouseEnter={(e)=>showTooltip(e)} onMouseLeave={(e)=>hideTooltip(e)} {...props}>
					{icon && <i className={icon} />}
					<span className='sr-only'>{children}</span>
					{isMenu.caretDirection && <i className={`caret fas fa-caret-${isMenu.caretDirection}`}></i>}
				</button>
				<div ref={popoverRef} popover='hint' style={{ positionAnchor: anchorName, ...style }}>{children}</div>
			</>
		);
	} else {
		return (
			<button id={id} className={className} style={{ anchorName }} {...props}>
				{icon && <i className={icon} />}
				{children}
				{isMenu.caretDirection && <i className={`caret fas fa-caret-${isMenu.caretDirection}`}></i>}
			</button>
		);
	}
};

module.exports = Button;