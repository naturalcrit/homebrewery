import { createRoot } from "react-dom/client";
import Homebrew from "./homebrew.jsx";

const props = window.__INITIAL_PROPS__ || {};
window.onload = ()=> {console.log('props: ', window.__INITIAL_PROPS__)};

createRoot(document.getElementById("reactRoot")).render(<Homebrew {...props} />);
