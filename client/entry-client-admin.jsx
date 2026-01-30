import React from 'react'
import { hydrateRoot } from 'react-dom/client';
import Admin from './admin.jsx';

import './admin/admin.less'

window.start_app = (props) => {
  hydrateRoot(
    document.getElementById('reactRoot'),
    <Admin {...props} />
  )
}
