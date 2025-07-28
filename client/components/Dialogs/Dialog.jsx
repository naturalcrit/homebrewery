require('./Dialog.less');

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const Dialog = ({ title = '!', zone, onClose = ()=>{}, children, openModal, ...props })=>{
	const [mounted, setMounted] = useState(false);
	const ref = useRef();


	useEffect(()=>{
		setMounted(true);
	}, []);

	useEffect(()=>{
		if(openModal){
			console.log('modalOpen is: ', openModal);
			ref.current?.showModal();
		} else {
			ref.current?.close();
		}
	}, [openModal]);

	const dialogContent = (
		<dialog
			ref={ref}
			className={props.className}
			onClose={onClose}
		>
			{children}
		</dialog>
	);

	if(!mounted) {
		return null;
	}

	return createPortal(
		dialogContent,
		document.getElementById(zone) || document.body
	);
};

const Title = ({ title, children })=>{
	return <h2 className='dialog-title'>{children || title}</h2>;
};

const Content = ({ children })=>{
	return <div className='dialog-content'>{children}</div>;
};

const Footer = ({ children })=>{
	const handleClose = (e)=>{
		const dialogEl = e.target.closest('dialog');
		if(dialogEl) {
			dialogEl.close();
		}
	};

	return <footer className='dialog-footer'>
		{children}
		<button id='close' onClick={handleClose}>Close</button>
	</footer>;
};

Title.displayName = 'DialogTitle';
Footer.displayName = 'DialogFooter';
Content.displayName = 'DialogContent';

Dialog.Title = Title;
Dialog.Content = Content;
Dialog.Footer = Footer;

Dialog.displayName = 'Dialog';

module.exports = Dialog;