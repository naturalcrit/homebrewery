import './claudeModal.less';
import React, { useState, useRef, useEffect } from 'react';
import request from '../../utils/request-middleware.js';

export default function ClaudeModal({ brew, onInsert, onClose }){
	const [prompt, setPrompt] = useState('');
	const [response, setResponse] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [copied, setCopied] = useState(false);

	const dialogRef = useRef(null);
	const textareaRef = useRef(null);

	useEffect(()=>{
		dialogRef.current?.showModal();
		textareaRef.current?.focus();
	}, []);

	const handleSubmit = async (e)=>{
		e.preventDefault();
		if(!prompt.trim() || isLoading) return;

		setIsLoading(true);
		setError(null);
		setResponse('');

		try {
			const res = await request
				.post('/api/claude')
				.send({
					prompt   : prompt.trim(),
					brewText : brew?.text || ''
				});

			setResponse(res.body.response);
		} catch (err) {
			setError(err.response?.body?.error || err.message || 'Failed to get response');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopy = ()=>{
		navigator.clipboard.writeText(response);
		setCopied(true);
		setTimeout(()=>setCopied(false), 2000);
	};

	const handleInsert = ()=>{
		if(onInsert && response) {
			onInsert(response);
			onClose();
		}
	};

	const handleClose = ()=>{
		dialogRef.current?.close();
		onClose();
	};

	const handleKeyDown = (e)=>{
		if(e.key === 'Escape') {
			handleClose();
		}
		// Ctrl/Cmd + Enter to submit
		if((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			handleSubmit(e);
		}
	};

	return (
		<dialog ref={dialogRef} className='claudeModal' onKeyDown={handleKeyDown}>
			<div className='modalHeader'>
				<h2><i className='fas fa-robot' /> AI Assist</h2>
				<button className='closeButton' onClick={handleClose} title='Close'>
					<i className='fas fa-times' />
				</button>
			</div>

			<form onSubmit={handleSubmit} className='promptForm'>
				<textarea
					ref={textareaRef}
					value={prompt}
					onChange={(e)=>setPrompt(e.target.value)}
					placeholder='Ask Claude to help with your homebrew...&#10;&#10;Examples:&#10;- Create a CR 5 undead monster&#10;- Review this stat block for balance&#10;- Write a 3rd level evocation spell&#10;- Format this as a class feature table'
					rows={5}
					disabled={isLoading}
				/>
				<div className='formActions'>
					<button
						type='submit'
						className='submitButton'
						disabled={!prompt.trim() || isLoading}
					>
						{isLoading ? (
							<><i className='fas fa-spinner fa-spin' /> Thinking...</>
						) : (
							<><i className='fas fa-paper-plane' /> Send</>
						)}
					</button>
					<span className='hint'>Ctrl+Enter to send</span>
				</div>
			</form>

			{error && (
				<div className='errorMessage'>
					<i className='fas fa-exclamation-circle' /> {error}
				</div>
			)}

			{response && (
				<div className='responseSection'>
					<div className='responseHeader'>
						<h3>Response</h3>
						<div className='responseActions'>
							<button onClick={handleCopy} className='actionButton' title='Copy to clipboard'>
								<i className={copied ? 'fas fa-check' : 'fas fa-copy'} />
								{copied ? ' Copied!' : ' Copy'}
							</button>
							<button onClick={handleInsert} className='actionButton primary' title='Insert at cursor'>
								<i className='fas fa-file-import' /> Insert
							</button>
						</div>
					</div>
					<pre className='responseContent'>{response}</pre>
				</div>
			)}
		</dialog>
	);
}
