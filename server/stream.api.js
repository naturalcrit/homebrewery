import express from 'express';

import Stream from './eventStreamSource.js';

const app = express.Router();

// Create Event Stream source for pages to listen to
app.get('/api/stream/:id', (req, res)=>{
	res.writeHead(200, {
		'Content-Type'     : 'text/event-stream',
		'Cache-Control'    : 'no-cache',
		'Connection'       : 'keep-alive',
		'Content-Encoding' : 'none'
	});

	const subId = Stream.subscribe(req.params.id, res);

	res.on('close', ()=>{
		Stream.unsubscribe(subId);
	});
});

export default app;