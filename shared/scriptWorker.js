/*eslint max-lines: ["warn", {"max": 304}]*/
const SUBSCRIPT_FUNCTION_NAME = 'subScriptFunction';

class ScriptValidationError extends Error {
	constructor(fname, message) {
		super(message);
		this.name = this.constructor.name;
		const cleanName = fname.replace(/[^a-z]/ig, '').substring(0, 20);
		this.message = `${cleanName}: ${message}`;
	}
};

class ScriptAPIValidator {
	constructor() {}

	#validateTypes(fname, forwardArgs, types, numOptional = 0) {
		let undefinedArgCount = 0;
		for (const arg of forwardArgs) {
			if(arg === undefined) {
				++undefinedArgCount;
			}
		}

		const excessArgs = forwardArgs.pop();
		const argsLength = forwardArgs.length + (Array.isArray(excessArgs) ? excessArgs.length : 0) - undefinedArgCount;
		if(argsLength !== types.length) {
			if(numOptional < 1) {
				const message = `Expects exactly ${types.length} arguments, got ${argsLength} instead`;
				throw new ScriptValidationError(fname, message);
			} else {
				const message = `Expects between ${types.length - numOptional} and ${types.length} arguments, got ${argsLength} instead`;
				throw new ScriptValidationError(fname, message);
			}
		}
		for (let i = 0; i < forwardArgs.length; ++i) {
			if(typeof forwardArgs[i] !== types[i]) {
				const argTypes = [];
				for (const arg of forwardArgs) {
					argTypes.push(typeof arg);
				}
				throw new ScriptValidationError(fname, `Expects types ${types.toString()}, got ${argTypes} instead`);
			}
		}
		return true;
	}

	#validateUserTextForDisplay(fname, text) {
		if(text.match(/[^\sa-z0-9]/i)) {
			throw new ScriptValidationError(fname, `messages may only contain spaces and alphanumeric characters`);
		}
		return true;
	}

	validateUntrustedFunction(fname, args) {
		if(typeof fname === 'string') {
			if(fname.indexOf('do') === 0 || fname.indexOf('get') === 0) {
				if(typeof this[fname] === 'function') {
					if(Array.isArray(args)) {
						args.push(args.length);
						return this[fname].apply(this, args);
					} else {
						return this[fname].apply(this, []);
					}
				}
			}
		}
		return false;
	}

	/**
     * validate 'get' functions
     */
	getBetween(...args) {
		this.#validateTypes('getBetween', args, ['string', 'string']);
		return true;
	}

	getSelected(...args) {
		this.#validateTypes('getSelected', args, []);
		return true;
	}

	getCSVFromFile(...args) {
		this.#validateTypes('getCSVFromFile', args, ['string'], 1);
		this.#validateUserTextForDisplay('getCSVFromFile', args[0]);
		return true;
	}

	getCSVFromSheets(...args) {
		this.#validateTypes('getCSVFromSheets', args, ['string', 'number', 'string'], 2);

		if(args[0].match(/[^\-a-z0-9_]/i)) {
			throw new ScriptValidationError('getCSVFromSheets', `URL is ill-formed`);
		}

		this.#validateUserTextForDisplay('getCSVFromSheets', args[2]);
		return true;
	}

	/**
     * validate 'do' functions
     */
	doReplaceBetween(...args) {
		this.#validateTypes('doReplaceBetween', args, ['string', 'string', 'string']);
		return true;
	}

	doReplaceSelected(...args) {
		this.#validateTypes('doReplaceSelected', args, ['string']);
		return true;
	}

	doInsertAfter(...args) {
		this.#validateTypes('doInsertAfter', args, ['string', 'string']);
		return true;
	}

	doAppendToStart(...args) {
		this.#validateTypes('doAppendToStart', args, ['string']);
		return true;
	}

	doAppendToEnd(...args) {
		this.#validateTypes('doAppendToEnd', args, ['string']);
		return true;
	}

	/**
     * validate utility 'do' functions
     */
	doReportError(...args) {
		this.#validateTypes('doReportError', args, ['string', 'string'], 1);
		return true;
	}
};

class ScriptAPIDeferrable {
	#worker;
	#promise;
	#resolved = false;
	#callbacks = [];
	#data = null;

	constructor(worker = null, resolver = null) {
		this.#worker = worker;
        if (resolver) {
		    const self = this;
		    this.#promise = new Promise(resolver).catch((error)=>{
		    	worker.doReportError(error.message, error.stack);
		    }).then((data)=>{
		    	self.resolve(data);
		    });
        }
	}

	#singlecall(callback) {
		try {
			callback(this.#data);
		} catch (error) {
			this.#worker.doReportError(error.message, error.stack);
		}
	}

	then(callback) {
		if(this.#resolved) {
			this.#singlecall(callback);
		} else {
			this.#callbacks.push(callback);
		}
		return this;
	}

	resolve(data) {
		if(this.#resolved) { throw new Error('ScriptAPIDeferrable can\'t resolve multiple times'); }
		this.#resolved = true;
		this.#data = data;
		for (const callback of this.#callbacks) {
			this.#singlecall(callback);
		}
		this.#callbacks = [];
	}
}

class ScriptAPIWorker {
	#context;
	#subScriptFunction;
	#validator = new ScriptAPIValidator();
	#started = false;

	constructor(context, subScriptFunction) {
		this.#context = context;
		this.#subScriptFunction = subScriptFunction;
	}

	start() {
		if(this.#started) return;
		this.#started = true;

		const listenForStart = (event)=>{
			if(event.data.fname === 'start') {
				this.#context.removeEventListener('message', listenForStart);
				this.#subScriptFunction(this);
			}
		};
		this.#context.addEventListener('message', listenForStart);

		const listenForError = (event)=>{
			this.doReportError(event.message, event.stack);
		};
		this.#context.addEventListener('error', listenForError);

		const listenForRejection = (event)=>{
			const message = `${event.reason.message}. All requests are blocked from Scripts.`;
			this.doReportError(message, event.reason.stack);
		};
		this.#context.addEventListener('unhandledrejection', listenForRejection);
	}

	#post(name, forwardArgs) {
		this.#context.postMessage({
			fname : name,
			args  : forwardArgs
		});
	}

	#postAndExpect(name, forwardArgs) {
		const context = this.#context;
		return new ScriptAPIDeferrable(this, (resolve)=>{
			const responseHandler = (event)=>{
				if(event.data.fname === (`r:${name}`)) {
					context.removeEventListener('message', responseHandler);
					resolve(event.data.data);
				}
			};
			context.addEventListener('message', responseHandler);
			context.postMessage({
				fname : name,
				args  : forwardArgs
			});
		});
	}

	/**
     * Send to main thread 'get' functions and expect a promise
     */
	getBetween(start, end, ...args) {
		if(this.#validator.getBetween(start, end, args)) {
			return this.#postAndExpect('getBetween', [start, end]);
		}
	}

	getSelected(...args) {
		if(this.#validator.getSelected(args)) {
			return this.#postAndExpect('getSelected', []);
		}
	}

	getCSVFromFile(message = '', ...args) {
		if(this.#validator.getCSVFromFile(message, args)) {
			return this.#postAndExpect('getCSVFromFile', [message]);
		}
	}

	getCSVFromSheets(sheetId, gid = 0, message = '', ...args) {
		if(this.#validator.getCSVFromSheets(sheetId, gid, message, args)) {
			return this.#postAndExpect('getCSVFromSheets', [sheetId, gid, message]);
		}
	}

	/**
     * Send to main thread 'do' functions
     */
	doReplaceBetween(start, end, text, ...args) {
		if(this.#validator.doReplaceBetween(start, end, text, args)) {
			this.#post('doReplaceBetween', [start, end, text]);
		}
	}

	doReplaceSelected(text, ...args) {
		if(this.#validator.doReplaceSelected(text, args)) {
			this.#post('doReplaceSelected', [text]);
		}
	}

	doInsertAfter(target, text, ...args) {
		if(this.#validator.doInsertAfter(target, text, args)) {
			this.#post('doInsertAfter', [target, text]);
		}
	}

	doAppendToStart(text, ...args) {
		if(this.#validator.doAppendToStart(text, args)) {
			this.#post('doAppendToStart', [text]);
		}
	}

	doAppendToEnd(text, ...args) {
		if(this.#validator.doAppendToEnd(text, args)) {
			this.#post('doAppendToEnd', [text]);
		}
	}

	/**
     * Utilities, should all be 'do' or not talk at all to the ScriptAPI
     */
	doReportError(message, stack = '', ...args) {
		if(this.#validator.doReportError(message, stack, args)) {
			this.#post('doReportError', [message, stack]);
		}
	}
};

const makeBrewScriptWorkerText = (scriptText)=>{
	return `'use strict';
let ${SUBSCRIPT_FUNCTION_NAME} = (api)=>{${scriptText}
};

(()=>{
${ScriptValidationError.toString()};
${ScriptAPIValidator.toString()};
${ScriptAPIDeferrable.toString()};
${ScriptAPIWorker.toString()};

const workerAPI = new ScriptAPIWorker(self, ${SUBSCRIPT_FUNCTION_NAME});
${SUBSCRIPT_FUNCTION_NAME} = null;
workerAPI.start();
})();
`;
};

export {
	SUBSCRIPT_FUNCTION_NAME,
	makeBrewScriptWorkerText,
    ScriptValidationError,
	ScriptAPIValidator,
    ScriptAPIDeferrable,
    ScriptAPIWorker
};

export default ScriptAPIWorker;