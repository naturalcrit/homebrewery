import React, { useEffect, useRef, useState } from 'react';
import BrewRenderer from './renderer/BrewRenderer.jsx';
import RebornEditor from './editor/EditorView.jsx';
import './editor/editor.css';
import demoDocument from './document/demoDocument.js';
import longDemo from './document/longDemo.js';
import ExportMenu from './ui/ExportMenu.jsx';
import './ui/exportMenu.css';

// Wave 3: switch from read-only renderer to the ProseMirror editor by default.
// A `?view=read` query string still loads the read-only renderer, useful for
// the visual smoke test and any future reader surface.
//
// Wave 5: `?doc=long` loads the multi-page stress document so the paginator
// has something substantial to chew on for screenshots / perf checks.
//
// Wave 6: `?print=true` renders the read-only paginated view with no chrome
// and signals readiness via `window.__rebornReady = true`. Puppeteer drives
// the PDF pipeline against this URL. The doc source can be passed inline via
// `?docPayload=<base64-encoded-json>` (suitable for ad-hoc printing where the
// AST has not been persisted server-side).

function decodeDocPayload(){
	if(typeof window === 'undefined') return null;
	const params = new URLSearchParams(window.location.search);
	const payload = params.get('docPayload');
	if(!payload) return null;
	try {
		// `atob` handles base64; we treat the result as UTF-8 JSON.
		// `escape` is deprecated; round-trip via Uint8Array + TextDecoder so
		// multi-byte chars (e.g. accented monster names) survive the decode.
		const bin = atob(payload);
		const bytes = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
		const json = new TextDecoder('utf-8').decode(bytes);
		return JSON.parse(json);
	} catch (e) {
		console.error('Failed to decode docPayload:', e);
		return null;
	}
}

// For larger docs, the route stashes the AST server-side and passes a
// `payloadId` instead of inlining the doc in the URL. We fetch it from
// `/api/reborn/pdf/payload/:id`. Returns a Promise that resolves to the AST
// or null if the id isn't recognized.
function fetchDocPayload(){
	if(typeof window === 'undefined') return null;
	const params = new URLSearchParams(window.location.search);
	const id = params.get('payloadId');
	if(!id) return null;
	return fetch(`/api/reborn/pdf/payload/${encodeURIComponent(id)}`)
		.then((r)=>{
			if(!r.ok) throw new Error(`payload fetch ${r.status}`);
			return r.json();
		})
		.catch((e)=>{
			console.error('Failed to fetch docPayload:', e);
			return null;
		});
}

function PrintShell({ doc }){
	const ref = useRef(null);
	useEffect(()=>{
		// Mark ready once the paginator settles. The MeasuringRenderer
		// transitions out of the 'measuring' phase asynchronously (one rAF
		// after mount). Watching for the appearance of a real `.page` with
		// content is the cleanest cross-browser signal that pagination is
		// done. Belt-and-suspenders: also fire after a 1500ms timeout so the
		// page is never permanently stuck.
		let cancelled = false;
		let raf = 0;
		const markReady = ()=>{
			if(cancelled || typeof window === 'undefined') return;
			window.__rebornReady = true;
			document.documentElement.setAttribute('data-reborn-ready', 'true');
			const meta = document.querySelector('meta[name="reborn-ready"]');
			if(meta) meta.setAttribute('content', 'true');
			else {
				const m = document.createElement('meta');
				m.setAttribute('name', 'reborn-ready');
				m.setAttribute('content', 'true');
				document.head.appendChild(m);
			}
		};
		const tick = ()=>{
			if(cancelled) return;
			const root = ref.current;
			if(!root){ raf = requestAnimationFrame(tick); return; }
			const pages = root.querySelectorAll('.brewRenderer > .pages > .page');
			const measuring = root.querySelector('.reborn-measure-placeholder');
			if(pages.length > 0 && !measuring){
				// Give fonts and images one more frame to settle.
				if(typeof document !== 'undefined' && document.fonts && document.fonts.ready){
					document.fonts.ready.then(()=>{
						requestAnimationFrame(()=>requestAnimationFrame(markReady));
					});
				} else {
					requestAnimationFrame(markReady);
				}
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		const fallback = setTimeout(markReady, 5000);
		return ()=>{ cancelled = true; cancelAnimationFrame(raf); clearTimeout(fallback); };
	}, [doc]);
	return (
		<div ref={ref} className='reborn-print-shell'>
			<style>{`
				@page { size: 215.9mm 279.4mm; margin: 0; }
				html, body {
					background: white !important;
					margin: 0; padding: 0;
					width: 215.9mm;
					height: auto;
					min-height: auto;
					overflow: visible;
				}
				body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
				#reactRoot { width: 100%; height: auto; min-height: auto; overflow: visible; }
				/* Kill the dark surrounding chrome. */
				.reborn-toolbar, .reborn-export-menu { display: none !important; }
				/* The dark scroll-container becomes a passive flow when printing —
				   no fixed height, no overflow clip. */
				.brewRenderer {
					height: auto !important;
					min-height: 0 !important;
					padding: 0 !important;
					background: white !important;
					overflow: visible !important;
				}
				.brewRenderer .pages {
					display: block !important;
					gap: 0 !important;
					padding: 0 !important;
					background: white !important;
				}
				/* Each .page gets its own physical page. */
				.brewRenderer .pages > .page {
					box-shadow: none !important;
					margin: 0 !important;
					break-after: page;
					page-break-after: always;
					page-break-inside: avoid;
					break-inside: avoid;
				}
				.brewRenderer .pages > .page:last-child {
					break-after: auto;
					page-break-after: auto;
				}
			`}</style>
			<BrewRenderer document={doc} />
		</div>
	);
}

export default function RebornApp(props) {
	const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
	const isPrint = params.get('print') === 'true';
	const hasPayloadId = params.has('payloadId');
	const which = params.get('doc') === 'long' ? longDemo : demoDocument;

	// Print mode picks doc source in this order:
	//   1. `props.printDocument` (server-side initial props for stored brews)
	//   2. `?payloadId=<id>` (server-side cache for the PDF route — async)
	//   3. `?docPayload=<base64>` (ad-hoc printing of a small in-memory doc)
	//   4. `?doc=long` (the long demo) | otherwise demoDocument
	const initialPrintDoc = isPrint
		? (props.printDocument || decodeDocPayload() || (hasPayloadId ? null : which))
		: which;
	const [printDoc, setPrintDoc] = useState(initialPrintDoc);

	useEffect(()=>{
		if(!isPrint || !hasPayloadId || printDoc) return;
		const p = fetchDocPayload();
		if(!p) return;
		p.then((d)=>{ if(d) setPrintDoc(d); else setPrintDoc(which); });
	}, [isPrint, hasPayloadId, printDoc, which]);

	const initial = useRef(isPrint ? (printDoc || which) : which);
	const [doc, setDoc] = useState(isPrint ? (printDoc || which) : which);

	if(isPrint){
		if(!printDoc){
			// Awaiting payload fetch. Don't flip `__rebornReady` yet.
			return <div className='reborn-print-shell'>Loading…</div>;
		}
		return <PrintShell doc={printDoc} />;
	}

	const mode = params.get('view') === 'read' ? 'read' : 'edit';

	if(mode === 'read'){
		return (
			<>
				<ExportMenu document={doc} />
				<BrewRenderer document={doc} />
			</>
		);
	}

	return (
		<>
			<div className='reborn-toolbar'>
				<span>Homebrewery Reborn — Wave 6 editor</span>
				<a href='?view=read' style={{ marginLeft: 'auto', color: '#d6bd83' }}>Switch to read-only</a>
			</div>
			<ExportMenu document={doc} />
			<RebornEditor document={initial.current} onChange={setDoc} />
		</>
	);
}
