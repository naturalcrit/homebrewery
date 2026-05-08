// PDF export — client side.
//
// Architectural note (per plan.md "Output and Export"):
//   "The same renderer that draws the screen produces the PDF — different
//    output target, same content pipeline. Screen and print never diverge."
//
// We therefore do NOT roll our own jsPDF/pdfmake renderer here. Instead, we
// POST the AST to the server, which spins up a headless Chromium pointed at
// `/?print=true`, lets the BrewRenderer/MeasuringRenderer paginate the doc
// using exactly the same code paths the screen uses, and exports the result
// via Chrome's built-in PDF engine. The screen and the PDF are then
// guaranteed to match (modulo Chrome's print-stylesheet adjustments, which
// are minimal and we override with `@page { margin: 0 }`).

export async function exportPdf(documentAst, options = {}){
	if(typeof fetch !== 'function'){
		return { ok: false, error: 'fetch is not available in this environment' };
	}
	const route = options.route || '/api/reborn/pdf';
	let resp;
	try {
		resp = await fetch(route, {
			method  : 'POST',
			headers : { 'Content-Type': 'application/json' },
			body    : JSON.stringify({ documentJson: documentAst, options }),
		});
	} catch (e) {
		return { ok: false, error: `Network error: ${e.message}` };
	}
	if(!resp.ok){
		let bodyText = '';
		try { bodyText = await resp.text(); } catch (e) { /* ignore */ }
		return {
			ok     : false,
			status : resp.status,
			error  : `${resp.status} ${resp.statusText}${bodyText ? `: ${bodyText.slice(0, 200)}` : ''}`,
		};
	}
	const blob = await resp.blob();
	return { ok: true, blob, status: resp.status };
}

export default exportPdf;
