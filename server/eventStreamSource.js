import { EventEmitter } from 'events';

const Stream = new EventEmitter;

export default {
	emit : function(event) {return Stream.emit(event, ...([...arguments].slice(1)));},    // Arguments doesn't work for arrow functions
	on   : (event, listener)=>{return Stream.on(event, listener);},
	off  : (event, listener)=>{return Stream.off(event, listener);}
};