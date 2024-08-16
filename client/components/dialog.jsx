// Dialog box, for popups and modal blocking messages
const React = require('react');
const { useRef, useEffect } = React;

function Dialog({ dismissKey, closeText = 'Close', blocking = false, ...rest }) {
	const dialogRef = useRef(null);

	useEffect(()=>{
		if(!dismissKey || !localStorage.getItem(dismissKey)) {
			blocking ? dialogRef.current?.showModal() : dialogRef.current?.show();
		}
	}, []);

	const dismiss = ()=>{
		dismissKey && localStorage.setItem(dismissKey, true);
		dialogRef.current?.close();
	};

	return	(
		<dialog ref={dialogRef} onCancel={dismiss} {...rest}>
			{rest.children}
			<button className='dismiss' onClick={dismiss}>
				{closeText}
			</button>
		</dialog>
	);
};

export default Dialog;
