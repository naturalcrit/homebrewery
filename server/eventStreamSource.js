import { EventEmitter } from 'events';
import _ from 'lodash';
import { nanoid } from 'nanoid';

const UNSUB_DELAY = 60000; //ms

const Stream = new EventEmitter;

// Create array of stream subscribers
let subscribers = [];

const debounceUnsub = _.debounce((id)=>{ unsubscribe(id); }, UNSUB_DELAY, { leading: false, trailing: true });

// Listener functions
const subscribe = function(shareId, res){
	const subscriber = {
		id     : nanoid(), // NanoID is assumed globally unique
		shareId,
		stream : res,
		time   : new Date
	};

	subscribers.push(subscriber);

	Stream.emit('sendUpdate', 'subscribe', { id: subscriber.id, shareId: subscriber.shareId, time: subscriber.time });

	debounceUnsub(subscriber.id);
	return subscriber.id;
};

const unsubscribe = function(id){
	subscribers
		.filter((sub)=>{return sub.id == id;})
		.forEach((sub)=>{
			Stream.emit('sendUpdate', 'unsubscribe', { id: sub.id, shareId: sub.shareId, time: new Date });
		});

	subscribers = subscribers.filter((sub)=>{ return sub.id != id; });
};

// Create global sendUpdate listener
Stream.on('sendUpdate', (event, data)=>{
	console.log('Event:', event, '\nData:', data);
	subscribers
		.filter((sub)=>{return data.shareId == sub.shareId; })
		.forEach((sub)=>{
			sub?.stream?.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

			// invoke debounced unsub to delay execution
			debounceUnsub(sub.id);
		});
});

// DEBUG: Report subscriber count periodically
const REPORT_DELAY = 1000; //ms
const reportIntervalId = setInterval(()=>{
	console.log('Subscriber count:', subscribers.length);
}, REPORT_DELAY);

export default {
	emit : function(event) {return Stream.emit(event, ...([...arguments].slice(1)));},    // Arguments doesn't work for arrow functions
	on   : (event, listener)=>{return Stream.on(event, listener);},
	off  : (event, listener)=>{return Stream.off(event, listener);},
	subscribe,
	unsubscribe
};