// JSON export.
//
// The AST is the source of truth. Exporting JSON is the trivial case: dump the
// document in pretty-printed form. Round-tripping back is `JSON.parse`. Useful
// for backup, programmatic editing, and as the canonical "lossless" exchange
// format between Reborn instances.

export function exportJson(document){
	return `${JSON.stringify(document, null, 2)}\n`;
}

export default exportJson;
