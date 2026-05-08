// Export menu — small floating dropdown in the dark app chrome offering
// Markdown / JSON / PDF export. Each entry triggers a download in the user's
// browser. Markdown and JSON are produced fully client-side; PDF is produced
// by POSTing the AST to the server-side puppeteer route.

import React, { useCallback, useState } from 'react';
import { Download, FileText, FileCode, FileType2, Loader2 } from 'lucide-react';
import { exportMarkdown } from '../export/markdown.js';
import { exportJson }     from '../export/json.js';
import { exportPdf }      from '../export/pdf.js';

function safeFilename(title){
	const base = (title || 'reborn-document').toString();
	return base
		.replace(/[^\w\d._ -]/g, '')
		.replace(/\s+/g, '_')
		.slice(0, 64) || 'reborn-document';
}

function downloadBlob(blob, filename){
	if(typeof window === 'undefined') return;
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

export default function ExportMenu({ document: doc }){
	const [open, setOpen] = useState(false);
	const [busy, setBusy] = useState(null); // 'pdf' | null

	const onMarkdown = useCallback(()=>{
		const md = exportMarkdown(doc);
		const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
		downloadBlob(blob, `${safeFilename(doc?.metadata?.title)}.md`);
		setOpen(false);
	}, [doc]);

	const onJson = useCallback(()=>{
		const json = exportJson(doc);
		const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
		downloadBlob(blob, `${safeFilename(doc?.metadata?.title)}.json`);
		setOpen(false);
	}, [doc]);

	const onPdf = useCallback(async ()=>{
		setBusy('pdf');
		try {
			const result = await exportPdf(doc);
			if(result.ok){
				downloadBlob(result.blob, `${safeFilename(doc?.metadata?.title)}.pdf`);
			} else {
				alert(`PDF export failed: ${result.error || 'unknown error'}`);
			}
		} finally {
			setBusy(null);
			setOpen(false);
		}
	}, [doc]);

	return (
		<div className='reborn-export-menu' onMouseLeave={()=>setOpen(false)}>
			<button
				type='button'
				className='reborn-export-trigger'
				onClick={()=>setOpen((v)=>!v)}
				aria-haspopup='menu'
				aria-expanded={open}
				disabled={!!busy}
			>
				{busy === 'pdf' ? <Loader2 className='reborn-spin' size={14} /> : <Download size={14} />}
				<span>Export</span>
			</button>
			{open && (
				<div className='reborn-export-dropdown' role='menu'>
					<button type='button' role='menuitem' onClick={onMarkdown}>
						<FileText size={14} /> Markdown
					</button>
					<button type='button' role='menuitem' onClick={onJson}>
						<FileCode size={14} /> JSON
					</button>
					<button type='button' role='menuitem' onClick={onPdf} disabled={busy === 'pdf'}>
						<FileType2 size={14} /> PDF
					</button>
				</div>
			)}
		</div>
	);
}
