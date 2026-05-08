// Block manifest contract for Homebrewery Reborn.
//
// Every block type the editor and renderer support is described by ONE module
// that exports an object satisfying this contract. The registry composes these
// modules and feeds them to the cores; the cores read from the registry and
// have no knowledge of any individual block type. Adding a block type =
// dropping a new file in this directory and adding one import line to
// `registry.js`. Period.
//
// This file is intentionally JSDoc-only. The contract lives in plain JS so
// authors writing a manifest don't pay any TS toolchain cost.

/**
 * @typedef {Object} InlineRun
 * @property {string} text
 * @property {string[]} [marks]
 * @property {string} [href]
 * @property {string} [color]
 * @property {string} [title]
 */

/**
 * @typedef {Object} ASTNode
 * @property {string} type
 */

/**
 * The PM-node contribution of a manifest. Three shapes:
 *
 * - kind: 'standard' — a plain block node spec. PM consumes `spec` directly.
 *   Use this for paragraph, heading, blockquote, table, callouts, etc.
 *
 * - kind: 'atom' — an atom node (no PM-managed content; all data lives in
 *   `attrs`). Stat blocks, images, page/column breaks, spell blocks. The
 *   manifest MUST also supply a `NodeView` so the editor isn't stuck with
 *   a default rendering that can't read those attrs.
 *
 * - kind: 'group' — a manifest may contribute multiple PM nodes at once
 *   (e.g. table contributes table + tableRow + tableCell + tableHeader; note
 *   contributes note + noteTitle). `nodes` is a map of node-name -> spec.
 *   `name` still identifies the "primary" node — the one that appears in the
 *   slash menu, the one tests look up by, the one round-trip uses.
 *
 * @typedef {{ kind: 'standard'|'atom', spec: object } | { kind: 'group', name: string, nodes: Object<string, object> }} PmNodeContribution
 */

/**
 * @typedef {(node: any, view: any, getPos: () => number) => {
 *   dom: HTMLElement,
 *   contentDOM?: HTMLElement,
 *   update?: (node: any) => boolean,
 *   selectNode?: () => void,
 *   deselectNode?: () => void,
 *   stopEvent?: (event: Event) => boolean,
 *   ignoreMutation?: () => boolean,
 *   destroy?: () => void,
 * }} NodeViewFactory
 */

/**
 * @typedef {Object} BlockManifest
 *
 * @property {string} type
 *   Unique key. Matches BOTH the AST `type` field and the PM node name. The
 *   slash menu, the registry, and the importer all key off this string.
 *
 * @property {string} label
 *   Human-readable name. Shown in the slash menu and contextual menus.
 *
 * @property {'Rules'|'Text'|'Layout'|'Tables'|'Media'|'Callouts'} category
 *   Grouping for the slash menu.
 *
 * @property {string} icon
 *   `lucide-react` icon name (e.g. 'Shield'). The slash menu reads this.
 *
 * @property {string[]} [slashAliases]
 *   Extra fuzzy-search keywords beyond `label` and `type`.
 *
 * @property {boolean} [keepTogether]
 *   Hint for Wave 5's paginator. If true, the block should not be split
 *   across pages or columns.
 *
 * @property {(overrides?: Partial<ASTNode>) => ASTNode} [createAst]
 *   Produce a default AST node of this type. Slash-insert and "new doc" use
 *   this. Optional for nodes the editor never inserts (e.g. internal child
 *   nodes like noteTitle).
 *
 * @property {(node: ASTNode) => string[]} [validateAst]
 *   Returns an array of error strings (empty if valid). Called by importers
 *   and Wave 7's structural validator.
 *
 * @property {PmNodeContribution} pmNode
 *
 * @property {string} [pmName]
 *   Override the PM node name when it must differ from `type`. The default is
 *   `type`. Used by the quote manifest, whose AST type is `quote` but whose
 *   PM node is `blockquote` (so PM's built-in commands like `wrapIn` work).
 *
 * @property {NodeViewFactory} [NodeView]
 *   PM NodeView constructor. REQUIRED for atom nodes; optional otherwise.
 *
 * @property {React.ComponentType<{ block: ASTNode }>} [Render]
 *   Read-only React component. The renderer's `Block` wrapper looks this up
 *   keyed by `type`.
 *
 * @property {(astNode: ASTNode, schema: any) => any} [astToPm]
 *   AST -> PM Node. If absent, `convert.js` falls back to a generic mapping
 *   based on the manifest's pmNode kind: standard nodes get inline content
 *   from `node.content`; atoms get attrs cherry-picked from the AST.
 *
 * @property {(pmNode: any) => ASTNode} [pmToAst]
 *   PM Node -> AST. Symmetric fallback. The default for atoms copies attrs;
 *   the default for standard nodes reads inline content.
 *
 * @property {(lines: string[], index: number, ctx: any) => ({ node: ASTNode, advance: number } | null)} [importMarkdown]
 *   Markdown contributor. Tries to recognize the block at lines[index];
 *   returns the produced AST node and how many lines it consumed, or null.
 *
 * @property {number} [importPriority]
 *   Higher = tried first. Default is 100 if omitted.
 *
 * @property {(node: ASTNode) => string} [exportMarkdown]
 *   Serialize back to markdown. Used by the round-trip and JSON export tests.
 *
 * @property {Array<{ id: string, label: string, keywords?: string,
 *   icon?: string, category?: string,
 *   insert: (state: any, dispatch: any, range: { from: number, to: number }, schema: any) => boolean
 * }>} [slashItems]
 *   Optional override: most manifests don't need this — the registry
 *   synthesizes a single slash-menu entry from `type`, `label`, `category`,
 *   `slashAliases`, and `createAst`. A manifest that contributes multiple
 *   sibling slash entries (e.g. list contributes both Bullet List and
 *   Ordered List) supplies its own list here. The `insert` callback is
 *   responsible for producing the right PM node and replacing the slash
 *   range; the registry handles range deletion only if the manifest does
 *   not (see `defaultSlashInsert` in registry.js).
 */

// Re-exported as a runtime no-op so manifests can `import { /* type info */ }`
// from a single canonical entry point (and so our test suite has a place to
// hang an "every manifest implements the contract" check).
export const MANIFEST_CONTRACT = Symbol('BlockManifestContract');
