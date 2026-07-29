import { createRoot } from 'react-dom/client';
import Admin from './admin.jsx';
import { bootstrapAnchorPositioningPolyfill } from '@components/anchorPositioningPolyfill.js';

const props = window.__INITIAL_PROPS__ || {};

createRoot(document.getElementById('reactRoot')).render(<Admin {...props} />);
bootstrapAnchorPositioningPolyfill();
