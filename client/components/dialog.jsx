// Dialog as a separate component
const React = require('react');
const { useState, useRef, useEffect } = React;

function Dialog({ dismissKey, closeText = 'Close', blocking = false, children, ...rest }) {
	const ref = useRef();

	const [open, setOpen] = useState(false);

	useEffect(()=>{
		if(!window || !dismissKey) return;
		if(!localStorage.getItem(dismissKey)){
			setOpen(true);
		}
	}, []);

	useEffect(()=>{
		if(open) {
			blocking ? ref.current?.showModal() : ref.current?.show();
		} else {
			ref.current?.close();
		}
	}, [open]);

	const dismiss = function(){
		localStorage.setItem(dismissKey, true);
		setOpen(false);
	};

	if(!open) return;
	return (
		<dialog
			ref={ref}
			onCancel={()=>dismiss()}
			{...rest}
		>
			<button
				className='dismiss'
				onClick={()=>dismiss()}
			>
        	{closeText}
			</button>
			{children}
		</dialog>
	);
}

export default Dialog;