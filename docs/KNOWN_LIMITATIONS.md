# Known Limitations

Accepted trade-offs and hard constraints of Homebrewery. For reasoning on design decisions, see DEVELOPMENT_PHILOSOPHY.md.

## By Design (See DEVELOPMENT_PHILOSOPHY.md for Why)

No Server-Side PDF Generation: Use browser print, external tools (PrinceXML, DocRaptor, Puppeteer), or download HTML and process locally.

No Public Render API: Cannot POST markdown and get HTML/PDF. Alternative: Download Marked.js as a local bundle (JosefUtbelt demonstrated in PR #2269).

No Real-Time Collaboration: Multiple users can't edit simultaneously. Use Git for versioning or coordinate offline.

No Plugin System: Extensions are built-in. Fork the repo if you need custom behavior.

No Comprehensive XSS Protection: Homebrewery allows user CSS and HTML; risk is accepted. Don't render untrusted content.

## Technical Constraints

CSS Masks Fail in PDF: `mask: exclude` works on screen but breaks in PDF export (browser PDF limitation). Workaround: Use border-radius, box-shadow, standard CSS instead.

Image Quality Issues: Images corrupt or distort when printed with CSS transforms/filters. Workaround: Simplify image styling, avoid filters, test print preview first.

Large Documents Slow Down: 5000+ lines cause lag (no virtual scrolling). Workaround: Split content, simplify CSS, reduce images.

Browser Variance: Chrome best for print. Firefox, Safari have inconsistencies. Mobile browsers struggle with large documents.

## Not Implemented

No footnotes, strikethrough, task lists, full HTML-in-markdown support.
No code syntax highlighting (basic formatting only).
No DPI control in browser PDF (user controls via print dialog).
No offline editing with sync (download, edit locally, re-upload as new brew).
Only TXT download (HTML available via /source endpoint, Markdown export not built).
Only Google Drive for cloud
