import React from 'react';
import MeasuringRenderer from '../layout/MeasuringRenderer.jsx';
import './renderer.css';

// Top-level read-only renderer.
//
// Wave 5: pagination is real. Block flow is handed to the MeasuringRenderer
// which measures heights at column width, runs the headless paginator, then
// emits one `.page` per chunk. Each `.page` remains a direct child of
// `.pages` so the canonical PHB theme's alternating footer ornament rule
// (`.page:nth-child(even)::after { transform: scaleX(-1) }`) keeps firing.
// We don't style anything inside the page from this layer — the canonical
// stylesheet still owns column flow, padding, and ornament.

export default function BrewRenderer({ document }) {
	if (!document) return null;
	return <MeasuringRenderer document={document} />;
}
