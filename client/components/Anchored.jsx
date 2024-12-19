import React, { useState, useRef, forwardRef, useEffect, cloneElement, Children } from 'react';
import './Anchored.less';

// Anchored is a wrapper component that must have as children an <AnchoredTrigger> and a <AnchoredBox> component.
// AnchoredTrigger must have a unique `id` prop, which is passed up to Anchored, saved in state on mount, and
// then passed down through props into AnchoredBox.  The `id` is used for the CSS Anchor Positioning properties.
// **The Anchor Positioning API is not available in Firefox yet**
// So in Firefox the positioning isn't perfect but is likely sufficient, and FF team seems to be working on the API quickly.

// When Anchor Positioning is added to Firefox, this can also be rewritten using the Popover API-- add the `popover` attribute
// to the container div, which will render the container in the *top level* and give it better interactions like
// click outside to dismiss.  **Do not** add without Anchor, though, because positioning is very limited with the `popover`
// attribute.


const Anchored = ({ children })=>{
	const [visible, setVisible] = useState(false);
	const [anchorId, setAnchorId] = useState(null);
	const boxRef = useRef(null);
	const triggerRef = useRef(null);

	// promote trigger id to Anchored id (to pass it back down to the box as "anchorId")
	useEffect(()=>{
		if(triggerRef.current){
			setAnchorId(triggerRef.current.id);
		}
	}, []);

	// close box on outside click or Escape key
	useEffect(()=>{
		const handleClickOutside = (evt)=>{
			if(
				boxRef.current &&
				!boxRef.current.contains(evt.target) &&
				triggerRef.current &&
				!triggerRef.current.contains(evt.target)
			) {
				setVisible(false);
			}
		};

		const handleEscapeKey = (evt)=>{
			if(evt.key === 'Escape') setVisible(false);
		};

		window.addEventListener('click', handleClickOutside);
		window.addEventListener('keydown', handleEscapeKey);

		return ()=>{
			window.removeEventListener('click', handleClickOutside);
			window.removeEventListener('keydown', handleEscapeKey);
		};
	}, []);

	const toggleVisibility = ()=>setVisible((prev)=>!prev);

	// Map children to inject necessary props
	const mappedChildren = Children.map(children, (child)=>{
		if(child.type === AnchoredTrigger) {
			return cloneElement(child, { ref: triggerRef, toggleVisibility, visible });
		}
		if(child.type === AnchoredBox) {
			return cloneElement(child, { ref: boxRef, visible, anchorId });
		}
		return child;
	});

	return <>{mappedChildren}</>;
};

// forward ref for AnchoredTrigger
const AnchoredTrigger = forwardRef(({ toggleVisibility, visible, children, className, ...props }, ref)=>(
	<button
		ref={ref}
		className={`anchored-trigger${visible ? ' active' : ''} ${className}`}
		onClick={toggleVisibility}
		style={{ anchorName: `--${props.id}` }}   // setting anchor properties here allows greater recyclability.
		{...props}
	>
		{children}
	</button>
));

// forward ref for AnchoredBox
const AnchoredBox = forwardRef(({ visible, children, className, anchorId, ...props }, ref)=>(
	<div
		ref={ref}
		className={`anchored-box${visible ? ' active' : ''} ${className}`}
		style={{ positionAnchor: `--${anchorId}` }}   // setting anchor properties here allows greater recyclability.
		{...props}
	>
		{children}
	</div>
));

export { Anchored, AnchoredTrigger, AnchoredBox };
