import { renderToString } from 'react-dom/server';
import Homebrew from './homebrew/homebrew.jsx';

export default (props) => renderToString(<Homebrew {...props} />);
