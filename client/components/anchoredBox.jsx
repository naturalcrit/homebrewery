require('./anchoredBox.less');
import React, { useState, useRef, useEffect } from 'react';

const AnchoredBox = ({ anchorPoint = 'center', className, children, ...props })=>{
	const [visible, setVisible] = useState(false);
	const triggerRef = useRef(null);
	const boxRef = useRef(null);

	useEffect(()=>{
		const handleClickOutside = (evt)=>{
			if(boxRef.current &&
				!boxRef.current.contains(evt.target) &&
				triggerRef.current &&
				!triggerRef.current.contains(evt.target)){
				setVisible(false);
			}
		};
		window.addEventListener('click', handleClickOutside);

		const iframe = document.querySelector('iframe');
		if(iframe) {
			iframe.addEventListener('load', ()=>{
				const iframeDoc = iframe.contentWindow.document;
				if(iframeDoc) {
					iframeDoc.addEventListener('click', handleClickOutside);
				}
			});
		}

		return ()=>{
			window.removeEventListener('click', handleClickOutside);
			if(iframe?.contentWindow?.document) {
				iframe.contentWindow.document.removeEventListener('click', handleClickOutside);
			}
		};
	}, []); // Empty dependency array to run effect on mount only

	const handleClick = ()=>{
		setVisible(!visible);
	};

	return (
		<>
			<button className={`${className} anchored-trigger${visible ? ' active' : ''}`} onClick={handleClick} ref={triggerRef}>
				<i className='fas fa-gear' />
			</button>
			<div className={`anchored-box${visible ? ' active' : ''}`}  ref={boxRef}>
				<h1>{props.title}</h1>
				{children}
			</div>
		</>
	);
};

export default AnchoredBox;
