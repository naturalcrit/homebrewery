// Page-break regex patterns shared between the editor's page-map scanner
// (client/components/codeEditor/codeEditor.jsx) and the renderer's page-split
// (client/homebrew/brewRenderer/brewRenderer.jsx). Keep semantics in lockstep:
// drift here will silently desync the cursor-page indicator from the rendered output.

export const PAGEBREAK_REGEX_V3       = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
export const PAGEBREAK_REGEX_LEGACY   = /\\page(?:break)?/m;
export const COLUMNBREAK_REGEX_LEGACY = /\\column(:?break)?/m;
