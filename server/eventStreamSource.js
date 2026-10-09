import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

const Stream = new EventEmitter;

// After Stream starts, send initStream event
Stream.on('open', ()=>{
	Stream.emit('sendUpdate', 'initStream', { time: new Date });
});

// Create array of stream subscribers
const subscribers = [];

// Listener functions
const subscribe = function(res){
	const id = nanoid();
	subscribers.push({ id, 'stream': res });

	res.write(`event: subscribe\ndata: { id: ${id} }\n\n`);
	return id;
};

const unsubscribe = function(id){
	subscribers = subscribers.filter((sub)=>{ return sub.id != id; });
};

// Create global sendUpdate listener
Stream.on('sendUpdate', (event, data)=>{
	console.log('Event:', event, '\nData:', data);
	subscribers.forEach((sub, idx)=>{
		sub?.stream?.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
	});
});

export default {
	emit : function(event) {return Stream.emit(event, ...([...arguments].slice(1)));},    // Arguments doesn't work for arrow functions
	on   : (event, listener)=>{return Stream.on(event, listener);},
	off  : (event, listener)=>{return Stream.off(event, listener);},
	subscribe,
	unsubscribe
};