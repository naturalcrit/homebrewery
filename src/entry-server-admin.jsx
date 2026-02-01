import { renderToString } from 'react-dom/server';
import Admin from './admin/admin.jsx';

export default (props) => renderToString(<Admin {...props} />);