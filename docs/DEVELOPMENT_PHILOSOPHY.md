# Development Philosophy

The core principle that drives all architectural decisions: Never execute user code on the server.

## Why Client-Side Rendering?

Markdown parsing and rendering happens in the user's browser, never on the server. This single decision cascades through the entire architecture.

Security: Malicious markdown can't crash the server or affect other users. Code execution is isolated to one user's browser.
Scalability: Zero server CPU overhead for rendering. No bottleneck as user base grows.
Resilience: One user's broken markdown doesn't affect others. Server remains stable.
Responsibility: Users control their content and how it renders. They're not dependent on server features.

Trade-off: Can't offer server-side features like native PDF generation or advanced rendering options.

## Why No Server-Side PDF Generation?

Would require executing user markdown on the server to render it. Violates the core principle.

Instead: Users print to PDF via browser (works everywhere, free, gives users full control). For advanced needs, they use external tools (PrinceXML, DocRaptor, Puppeteer) locally.

Related: Issue #3190 documents the complexity of proper PDF generation (DPI control, PDF/X specs for print-on-demand, bookmarks, etc). The effort required to do this correctly on server isn't justified given the principle.

## Why No Public Render API?

Issue #2264 proposed: "POST markdown → get back HTML/PDF". Rejected for three reasons:

Principle violation: Would require rendering user markdown on server.
DOS risk: Rendering is CPU-intensive. Open endpoint = trivial abuse vector. Rate limiting and auth makes it complex.
Alternative exists: JosefUtbelt proved users can download Marked.js as a bundle and run it locally (PR #2269). This gives full control without server burden.

Maintainers' response from issue: "We don't want to execute foreign code on our servers if we can help it."

## Why /print Endpoint Was Removed

In May 2024, the `/print` endpoint was deleted. It returned standalone HTML of a rendered brew.

Why removed? Considered redundant (browser print existed), very few users relied on it (2-3 reported), maintenance burden. Why not restore? Would reintroduce the principle violation; currently has low priority.

Issue #3827 requests restoration with "solution found" label, but it hasn't been implemented.

## Why No Real-Time Collaboration?

Low demand. Complex to implement (WebSocket infrastructure, conflict resolution, scaling). Users can version with Git or coordinate offline.

## Why No Plugin System?

Plugins would be installed at runtime and could break rendering unpredictably. Instead, extensions are built into the repo. Users can fork if they need custom behavior.

## Why XSS Risk Remains (Issue #546)

Homebrewery allows user CSS and HTML because it assumes users render their own content locally. Complete sanitization would break styling freedom. Risk is accepted; users should assume untrusted code runs locally.
