import { EventEmitter } from 'events';
import _ from 'lodash';
import { nanoid } from 'nanoid';

const UNSUB_DELAY = 60000; //ms

const Stream = new EventEmitter;

// Create array of stream subscribers
let subscribers = [];

const debounceUnsub = _.debounce((id)=>{ unsubscribe(id); }, UNSUB_DELAY, { leading: false, trailing: true });

// Listener functions
const subscribe = function(res){
	const id = nanoid();
	subscribers.push({ id, 'stream': res });

	res.write(`event: subscribe\ndata: { id: ${id} }\n\n`);

	debounceUnsub(id);
	return id;
};

const unsubscribe = function(id){
	subscribers
		.filter((sub)=>{return sub.id == id;})
		.forEach((sub)=>{
			sub.stream.write(`event: unsubscribe\ndata: { id: ${id} }\n\n`);
		});

	subscribers = subscribers.filter((sub)=>{ return sub.id != id; });
};

// Create global sendUpdate listener
Stream.on('sendUpdate', (event, data)=>{
	console.log('Event:', event, '\nData:', data);
	subscribers.forEach((sub)=>{
		sub?.stream?.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

		// invoke debounced unsub to delay execution
		debounceUnsub(sub.id);
	});
});

export default {
	emit : function(event) {return Stream.emit(event, ...([...arguments].slice(1)));},    // Arguments doesn't work for arrow functions
	on   : (event, listener)=>{return Stream.on(event, listener);},
	off  : (event, listener)=>{return Stream.off(event, listener);},
	subscribe,
	unsubscribe
};