import React, { useState, useRef, useEffect, forwardRef } from 'react';
import './anchoredBox.less';

const AnchoredBox = ({ anchorPoint = 'center', className, children, ...props })=>{
	const [visible, setVisible] = useState(false);
	const triggerRef = useRef(null);
	const boxRef = useRef(null);

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
	}, []);

	const handleClick = ()=>{
		setVisible(!visible);
		triggerRef.current?.focus();
	};

	const handleKeyDown = (evt)=>{
		if(evt.key === 'Escape') {
			setVisible(false);
			triggerRef.current?.focus();
		}
	};

	return (
		<>
			<TriggerButton
				className={`${className} anchored-trigger${visible ? ' active' : ''}`}
				onClick={handleClick}
				ref={triggerRef}
			/>
			<div
				className={`anchored-box${visible ? ' active' : ''}`}
				ref={boxRef}
				onKeyDown={(evt)=>handleKeyDown(evt)}
			>
				<h1>{props.title}</h1>
				{children}
			</div>
		</>
	);
};

const TriggerButton = forwardRef((props, ref)=>(
	<button ref={ref} {...props}>
		<i className='fas fa-gear' />
	</button>
));

export default AnchoredBox;
