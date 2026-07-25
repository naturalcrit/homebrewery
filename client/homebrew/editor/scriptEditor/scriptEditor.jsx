/*eslint max-lines: ["warn", {"max": 268}]*/
import { usePapaParse } from 'react-papaparse';
import { ScriptAPIValidator, SUBSCRIPT_FUNCTION_NAME } from '@shared/scriptWorker.js';

const ERROR_REPORT_TOPLEVEL_NAME = 'Scripts';
const TIMEOUT_SCRIPT_REQUESTS = 60000;
const TIMEOUT_ALL_FUNCTIONALITY = TIMEOUT_SCRIPT_REQUESTS + 10000;

const ScriptAPI = class {
	#scriptName = '';
	#linesStart = 0;
	#linesEnd = 0;
	#nonPersistScriptRequestEnabled = true;

	#codeEditor;
	#editor;
	#editId;
	#worker;

	#validator = new ScriptAPIValidator();

	constructor(codeEditor, editor, editId) {
		this.#codeEditor = codeEditor;
		this.#editor = editor;
		this.#editId = editId;
	}

	/**
     *  Starts the user script as a worker and starts listening to messages from it
     **/
	start(subScript) {
		this.terminateWorker();

		this.#scriptName = subScript.name;
		this.#linesStart = subScript.linesStart;
		this.#linesEnd = subScript.linesEnd;

		const self = this;
		try {
			this.#worker = new Worker(`/brewscript/${this.#editId}/${this.#scriptName}`, {
				credentials : 'omit'
			});

			this.#worker.addEventListener('message', (event)=>{
				self.onWorkerMessage(event);
			});
			this.#worker.addEventListener('error', (event)=>{
				self.onWorkerError(event);
			});
			this.#worker.postMessage({ fname: 'start' });
		} catch (error) {
			this.doReportError(error.message, error.stack);
		}

		setTimeout(()=>{
			self.suppressAllNonPersistentScriptRequests();
		}, TIMEOUT_SCRIPT_REQUESTS);

		setTimeout(()=>{
			self.terminateWorker();
		}, TIMEOUT_ALL_FUNCTIONALITY);
	}

	onWorkerMessage(event) {
		if(typeof event.data === 'object' && this.#validator.validateUntrustedFunction(event.data.fname, event.data.args)) {
			if(event.data.fname.indexOf('do') === 0) {
				this[event.data.fname].apply(this, event.data.args);

			} else if(event.data.fname.indexOf('get') === 0) {
				const promise = this[event.data.fname].apply(this, event.data.args);
				const worker = this.#worker;

				promise.then((data)=>{
					worker.postMessage({
						fname : `r:${event.data.fname}`,
						data  : data
					});
				});
			}
		}
	}

	onWorkerError(event) {
		if(!event.isTrusted) return;

		// This should be SyntaxErrors, since we catch execution errors in a different path
		// Worker SyntaxErrors don't have a stack, so, we have to manually format it
		const adjustedLineNumber = event.lineno + this.#linesStart;
		const adjustedMessage = event.message.replace('Uncaught ', '');
		const stack = `${adjustedMessage}
    at ${ERROR_REPORT_TOPLEVEL_NAME} (${this.#scriptName}:${adjustedLineNumber}:${event.colno})`;

		this.#editor?.updateScriptRequest({
			type       : 'reporterror',
			message    : adjustedMessage,
			stack      : stack,
			scriptName : this.#scriptName,
			persist    : true
		});
	}

	suppressAllNonPersistentScriptRequests() {
		if(this.#nonPersistScriptRequestEnabled) {
			this.#nonPersistScriptRequestEnabled = false;
			this.#editor?.timeoutScriptRequest();
		}
	}

	terminateWorker() {
		if(this.#worker) {
			this.suppressAllNonPersistentScriptRequests();
			this.#worker.terminate();
			this.#worker = null;
		}
	}

	#updateScriptRequest(request) {
		if(request && (request.persist || this.#nonPersistScriptRequestEnabled)) {
			this.#editor?.updateScriptRequest(request);
		}
	}

	/**
     *  Get data to be returned to the worker script
     *  get Functions must always return a Promise
     **/
	getBetween(start, end) {
		return new Promise((resolve)=>{
			const textBetween = this.#codeEditor?.getBetween(start, end);
			resolve(textBetween);
		});
	}

	getSelected() {
		return new Promise((resolve)=>{
			const selection = this.#codeEditor?.getCursorSelection();
			resolve(selection);
		});
	}

	getCSVFromFile(message) {
		return new Promise((resolve)=>{
			this.#updateScriptRequest({
				type     : 'uploadfile',
				title    : 'Script Request: Upload CSV from File',
				message  : message,
				callback : (e)=>{
					const fileContent = e.target.result;
					const { readString } = usePapaParse();
					readString(fileContent, {
						worker   : true,
						header   : true,
						complete : (results)=>{
							resolve(results);
						}
					});
				}
			});
		});
	}

	getCSVFromSheets(sheetId, gid, message) {
		return new Promise((resolve)=>{
			const URL = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?gid=${gid}&single=true&output=csv`;
			this.#updateScriptRequest({
				type     : 'readurl',
				title    : 'Script Request: Read CSV from URL',
				message  : message,
				URL      : URL,
				callback : ()=>{
					const { readRemoteFile } = usePapaParse();
					readRemoteFile(URL, {
						download : true,
						header   : true,
						complete : (results)=>{
							resolve(results);
						}
					});
				}
			});
		});
	}

	/**
     *  Modifies the captured editor
     **/
	doReplaceBetween(start, end, text) {
		this.#codeEditor?.replaceBetween(start, end, text);
	}

	doReplaceSelected(text) {
		this.#codeEditor?.injectText(text);
	}

	doInsertAfter(target, text) {
		const position = this.#codeEditor?.getPositionOf(target);
		if(position > -1) {
			this.#codeEditor?.insertAt(position + target.length, text);
		}
	}

	doAppendToStart(text) {
		this.#codeEditor?.insertAt(0, text);
	}

	doAppendToEnd(text) {
		const position = this.#codeEditor?.getCurrentLength();
		this.#codeEditor?.insertAt(position, text);
	}

	/**
     * Utilities, meta information
     * None should do any actual modifications
     */
	doReportError(message, stack) {
		// We do a lot of filtering to make this more usable to non-technical users,
		// So give an unfiltered error to technical users in the console
		console.error(stack);

		const stackLineRegex = /^(?<pre>\s+at )(?<context>[^\(\/]+) \((?<desc>.+):(?<lineno>\d+):(?<colno>\d+)\)$/;
		const stackLineNoContextRegex = /^(?<pre>\s+at )(?<desc>.+):(?<lineno>\d+):(?<colno>\d+)$/;
		const sourceStackLines = stack.split('\n');

		const targetStackLines = [sourceStackLines.shift().replace('Uncaught ', '')];
		for (const line of sourceStackLines) {
			let lineMatch = line.match(stackLineRegex);
			let scriptContext;
			if(lineMatch) {
				scriptContext = lineMatch.groups.context;
			} else {
				lineMatch = line.match(stackLineNoContextRegex);
				scriptContext = ERROR_REPORT_TOPLEVEL_NAME;
			}
			if(lineMatch) {
				const adjustedLineno = parseInt(lineMatch.groups.lineno) + this.#linesStart;
				// Only include lines that would be part of the user written script
				if(adjustedLineno <= this.#linesEnd) {
					scriptContext = scriptContext.replaceAll(`ScriptAPIWorker.${SUBSCRIPT_FUNCTION_NAME}`, ERROR_REPORT_TOPLEVEL_NAME);

					// NOTE: groups.desc is intentionally dropped so that we don't have to validate it (avoids using it for phishing)
					const newStackLine = `${lineMatch.groups.pre}${scriptContext} (${this.#scriptName}:${adjustedLineno}:${lineMatch.groups.colno})`;
					targetStackLines.push(newStackLine);
				}
			}
		}

		const adjustedMessage = message.replaceAll('. ', '! ').replace(/[^a-z\s0-9!]/ig, ' ').replace('Uncaught ', '').substring(0, 100);
		const newStack = targetStackLines.join('\n');
		this.#updateScriptRequest({
			type       : 'reporterror',
			message    : adjustedMessage,
			stack      : newStack,
			scriptName : this.#scriptName,
			persist    : true
		});
	}
};

const executeBrewScript = (api, subScript)=>{
	if(api instanceof ScriptAPI) {
		api.start(subScript);
	}
};

export {
	executeBrewScript
};
export default ScriptAPI;
