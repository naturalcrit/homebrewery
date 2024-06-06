// Dialog as a separate component
const React = require('react');
const { useState, useRef, useEffect } = React;

function Dialog({ dismissKey, closeText = 'Close', blocking = false, ...rest }) {
	const dialogRef = useRef();
	const [open, setOpen] = useState(false);

	useEffect(()=>{
		if(!dismissKey || !localStorage.getItem(dismissKey)) {
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
		dialogRef.current?.close();
		setOpen(false);
	};

	return (
		<dialog ref={dialogRef} onCancel={dismiss} {...rest}>
			<button className='dismiss' onClick={dismiss}>
        	{closeText}
			</button>
			{rest.children}
		</dialog>
	);
}

export default Dialog;