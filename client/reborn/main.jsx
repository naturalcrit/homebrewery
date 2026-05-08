import React from 'react';
import { createRoot } from 'react-dom/client';
import RebornApp from './App.jsx';
import './reborn.css';

const ensureStylesheet = (id, href)=>{
	if(document.getElementById(id)) return;
	const link = document.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = href;
	document.head.appendChild(link);
};

// Theme bundles inherit: 5ePHB extends Blank. The legacy server chains parents
// for /api/theme/.../bundle.json; we replicate the same load order here so the
// page picks up Blank's `.page` sizing/padding/box-sizing rules before 5ePHB
// adds its parchment + typography on top. Order matters — Blank first.
ensureStylesheet('reborn-theme-Blank', '/themes/V3/Blank/style.css');
ensureStylesheet('reborn-theme-5ePHB', '/themes/V3/5ePHB/style.css');

const props = window.__INITIAL_PROPS__ || {};
createRoot(document.getElementById('reactRoot')).render(<RebornApp {...props} />);
