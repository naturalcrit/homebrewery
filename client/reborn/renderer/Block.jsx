import React from 'react';
import { renderComponents } from '../blocks/registry.js';

// Wave 4: this file used to switch on block.type. It now does a single map
// lookup against the manifest registry, with no knowledge of any specific
// block type. Adding a block type means adding its manifest module and the
// matching import line in registry.js — never editing this file.

export default function Block({ block }) {
	const Render = renderComponents[block.type];
	if(!Render){
		// eslint-disable-next-line no-console
		console.warn('No render component registered for block type:', block.type);
		return null;
	}
	return <Render block={block} />;
}
