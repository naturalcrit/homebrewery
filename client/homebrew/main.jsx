import { createRoot } from "react-dom/client";
import Homebrew from "./homebrew.jsx";

const props = window.__INITIAL_PROPS__ || {};
console.log('props: ', window.__INITIAL_PROPS__);

createRoot(document.getElementById("reactRoot")).render(<Homebrew {...props} />);
