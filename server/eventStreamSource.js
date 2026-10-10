import { EventEmitter } from 'events';
import _ from 'lodash';
import { nanoid } from 'nanoid';

// DEBUG
const DEBUG = {
	showEvents          : true,
	showSubscriberCount : true
};

// Delays
const UNSUB_DELAY = 60 * 1000; //ms
const REFRESH_DELAY = 60 * 1000; //ms
const REPORT_DELAY = 5 * 1000; //ms


const Stream = new EventEmitter;

// Create array of stream subscribers
let subscribers = [];

// Listener functions
const subscribe = function(shareId, res){
	const id = nanoid(24); // NanoID is assumed globally unique;
	const subscriber = {
		id,
		shareId,
		stream     : res,
		time       : new Date,
		unsubTimer : setTimeout(()=>{ unsubscribe(id); }, UNSUB_DELAY)
	};

	subscribers.push(subscriber);

	Stream.emit('sendUpdate', 'subscribe', { id: subscriber.id, shareId: subscriber.shareId, time: subscriber.time });

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
	if(DEBUG.showEvents) console.log('Event:', event, '\nData:', data);
	subscribers
		.filter((sub)=>{return data.shareId == sub.shareId; })
		.forEach((sub)=>{
			if(event == 'brewUpdated'){
			// Reset the unsubscription timer
				clearTimeout(sub.unsubTimer);
				sub.unsubTimer = setTimeout(()=>{ unsubscribe(sub.id); }, REFRESH_DELAY);
			}

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