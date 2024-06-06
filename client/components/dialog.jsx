// Dialog as a separate component
const React = require('react');
const { useState, useRef, useEffect } = React;

function Dialog({ dismissKey, closeText = 'Close', blocking = false, ...rest }) {
	const dialogRef = useRef(null);
	const [open, setOpen] = useState(false);

	useEffect(()=>{
		if(!localStorage.getItem(dismissKey)) {
			!open && setOpen(true);
		}
	}, []);

	useEffect(()=>{
		if(open && !dialogRef.current?.open){
			blocking ? dialogRef.current?.showModal() : dialogRef.current?.show();
		} else {
			dialogRef.current?.close();
		}
	}, [open]);

	const dismiss = ()=>{
		dismissKey && localStorage.setItem(dismissKey, true);
		setOpen(false);
	};

	return <dialog ref={dialogRef} onCancel={dismiss} {...rest}>
		{rest.children}
		<button className='dismiss' onClick={dismiss}>
			{closeText}
		</button>
	</dialog>
	;
};

export default Dialog;