import React from "react";
import { hydrateRoot } from "react-dom/client";
import Homebrew from "./homebrew/homebrew.jsx";

// CSS MUST be imported here
import "./homebrew/homebrew.less"; // or wherever your CSS lives

// Polyfill `global` in the browser
if (typeof global === 'undefined') {
  window.global = window;
}

console.log("entry-client-homebrew");
const props = window.__SSR_PROPS__ || {};
console.log("props: ", props);
hydrateRoot(document.getElementById("reactRoot"), <Homebrew {...props} />);
