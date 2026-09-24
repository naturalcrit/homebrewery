import { createRoot } from 'react-dom/client';
import Homebrew from './homebrew.jsx';
import { bootstrapAnchorPositioningPolyfill } from '@components/anchorPositioningPolyfill.js';

const props = window.__INITIAL_PROPS__ || {};

createRoot(document.getElementById('reactRoot')).render(<Homebrew {...props} />);
bootstrapAnchorPositioningPolyfill();
