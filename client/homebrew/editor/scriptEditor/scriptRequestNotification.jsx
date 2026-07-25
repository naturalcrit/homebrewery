import './scriptRequestNotification.less';
import * as React from 'react';
import Dialog from '../../../components/dialog.jsx';

const ScriptRequestNotification = (props)=>{
	if(props.request === null) return null;

	const dismissScriptRequest = ()=>{
		if(props.updateScriptRequest) {
			props.updateScriptRequest(null);
		}
	};

	let reminder = (<section></section>);
	if(!props.request.persist) {
		reminder = (
			<section className='reminder'>
	        	<hr />
	        	<p>If you wish to dismiss this: wait, change tabs, or click Cancel.</p>
			</section>
		);
	}

	if(props.request.type === 'uploadfile') {
		const onFileLoad = (e)=>{
			dismissScriptRequest();

			const file = e.target.files[0];
			if(!file) return;

			const reader = new FileReader();
			reader.onload = (e)=>{
				props.request.callback(e);
			};
			reader.readAsText(file);
		};

		return <Dialog className='scriptRequestNotification' closeText='Cancel' onDismiss={dismissScriptRequest} >
			<h1>{props.request.title}</h1>
			<p>{props.request.message}</p>
			<button className='uploadFile' onClick={()=>{ document.getElementById('scriptRequestFile').click(); }}>Select File</button>
			<input id='scriptRequestFile' className='newFromLocal' type='file' onChange={onFileLoad} style={{ display: 'none' }} />
			{reminder}
		</Dialog>;
	}

	if(props.request.type === 'readurl') {
		const onURLCommitted = ()=>{
			dismissScriptRequest();

			props.request.callback();
		};

		return <Dialog className='scriptRequestNotification' closeText='Cancel' onDismiss={dismissScriptRequest} >
			<h1>{props.request.title}</h1>
			<p>{props.request.message}</p>
			<small>{props.request.URL}</small>
			<button className='commitURL' onClick={onURLCommitted}>Allow URL Read</button>
			{reminder}
		</Dialog>;
	}

	if(props.request.type == 'reporterror') {
		return <Dialog className='scriptRequestError' closeText='Close' onDismiss={dismissScriptRequest} >
			<h1>Script Error in: {props.request.scriptName}</h1>
			<p>{props.request.message}</p>
			<code>{props.request.stack.trim()}</code>
			{reminder}
		</Dialog>;
	}

	return null;

};

export default ScriptRequestNotification;
