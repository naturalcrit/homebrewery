import { EventEmitter } from 'events';
import _ from 'lodash';
import { nanoid } from 'nanoid';

import config from './config.js';

// DEBUG
const DEBUG = {
	showEvents          : config.get('showStreamEvents'),
	showSubscriberCount : config.get('showStreamSubscriberCount')
};

// Delays
const REPORT_DELAY = config.get('REPORT_DELAY') || 30 * 60 * 1000; //ms
const HEARTBEAT_DELAY = config.get('HEARTBEAT_DELAY') || 20 * 1000; //ms


const Stream = new EventEmitter;

// Create array of stream subscribers
let subscribers = [];

// Listener functions
const subscribe = function(shareId, res){
	const id = nanoid(24); // NanoID is assumed globally unique;
	const subscriber = {
		id,
		shareId,
		stream : res
	};

	subscribers.push(subscriber);

	Stream.emit('sendUpdate', 'subscribe', { id: subscriber.id, shareId: subscriber.shareId });

	return subscriber.id;
};

const unsubscribe = function(id){
	subscribers
		.filter((sub)=>{return sub.id == id;})
		.forEach((sub)=>{
			// Unsubscribe event - not currently used
			// Stream.emit('sendUpdate', 'unsubscribe', { id: sub.id, shareId: sub.shareId });
			sub?.stream?.status(200).end();
		});

	subscribers = subscribers.filter((sub)=>{ return sub.id != id; });
};

// Create heartbeat
const heartbeatId = config.get('node_env') != 'test' ?
	setInterval(()=>{
		if(DEBUG.showEvents){ console.log('STREAM HEARTBEAT @ ', new Date); };
		subscribers
			.forEach((sub)=>{
				sub?.stream?.write(`:\n\n`);
			});
	}, HEARTBEAT_DELAY)
	:
	undefined;

Stream.on('close', ()=>{
	console.log('STREAM CLOSE');
	clearInterval(heartbeatId);
});

// Create global sendUpdate listener
Stream.on('sendUpdate', (event, data)=>{
	if(DEBUG.showEvents) console.log('Event:', event, '\nData:', data);
	subscribers
		.filter((sub)=>{
			if(data?.id) return data.id == sub.id;
			return data.shareId == sub.shareId;
		})
		.forEach((sub)=>{
			sub?.stream?.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
		});
});

// DEBUG: Report subscriber count periodically
if(DEBUG.showSubscriberCount){
	const reportIntervalId = setInterval(()=>{
		console.log('Subscriber count:', subscribers.length, ' @ ', new Date);
	}, REPORT_DELAY);
}

export default {
	emit : function(event) {return Stream.emit(event, ...([...arguments].slice(1)));},    // Arguments doesn't work for arrow functions
	on   : (event, listener)=>{return Stream.on(event, listener);},
	off  : (event, listener)=>{return Stream.off(event, listener);},
	subscribe,
	unsubscribe
};