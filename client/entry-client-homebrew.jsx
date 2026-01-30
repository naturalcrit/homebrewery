import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import Homebrew from './homebrew/homebrew.jsx'

// CSS MUST be imported here
import './homebrew/homebrew.less' // or wherever your CSS lives

window.start_app = (props) => {
  hydrateRoot(
    document.getElementById('reactRoot'),
    <Homebrew {...props} />
  )
}
