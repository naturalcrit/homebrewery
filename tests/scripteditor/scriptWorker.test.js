
import { ScriptValidationError, ScriptAPIValidator, ScriptAPIWorker, ScriptAPIDeferrable,
         makeBrewScriptWorkerText } from '../../shared/scriptWorker.js';
import { brewScriptsToJSON, getSingleScriptFromText } from '../../shared/helpers.js';

const ContextFacade = class {
    #response;
    constructor(response) {
        this.#response = response;
    }

    addEventListener() {}

    removeEventListener() {}

    postMessage(data) {
        return this.#response(data);
    }
};

test('BrewScripts can generate at least one kind of script without hitting an error', ()=>{
	const rawscript = makeBrewScriptWorkerText('');
	const useStrictLead = `'use strict';`;
	const reducedScript = rawscript.substring(0, useStrictLead.length);

	expect(reducedScript).toBe(useStrictLead);
});

const runBrewWorker = (command) => {
    return new Promise((resolve, reject) => {
        const context = new ContextFacade((data) => {
            resolve(data);
        });
        const api = new ScriptAPIWorker(context);
        command(api);
    });
};

test('Verify all do_ api functions exist and pass minimum validation', async ()=>{
    let data = null;

    data = await runBrewWorker((api) => { api.doReplaceBetween("start", "end", "testmessage"); });
    expect(data.fname).toBe('doReplaceBetween');
    
    data = await runBrewWorker((api) => { api.doReplaceSelected("testmessage"); });
    expect(data.fname).toBe('doReplaceSelected');
    
    data = await runBrewWorker((api) => { api.doInsertAfter("target", "testmessage"); });
    expect(data.fname).toBe('doInsertAfter');
    
    data = await runBrewWorker((api) => { api.doAppendToStart("testmessage"); });
    expect(data.fname).toBe('doAppendToStart');
    
    data = await runBrewWorker((api) => { api.doAppendToEnd("testmessage"); });
    expect(data.fname).toBe('doAppendToEnd');
    
    data = await runBrewWorker((api) => { api.doReportError("testmessage"); });
    expect(data.fname).toBe('doReportError');
});

const runBrewWorkerGet = (command) => {
    return new Promise((resolve, reject) => {
        const deferredWrapper = new ScriptAPIDeferrable(null).then(res => {
            resolve(res);
        });
        const context = new ContextFacade((data) => {
            deferredWrapper.resolve(data);
        });
        const api = new ScriptAPIWorker(context);
        command(api);
    });
};

test('Verify all get_ api functions exist and pass minimum validation', async ()=>{
    let data = null;

    data = await runBrewWorkerGet((api) => { return api.getBetween("start", "end"); });
    expect(data.fname).toBe('getBetween');
    
    data = await runBrewWorkerGet((api) => { return api.getSelected(); });
    expect(data.fname).toBe('getSelected');
    
    data = await runBrewWorkerGet((api) => { return api.getCSVFromFile(); });
    expect(data.fname).toBe('getCSVFromFile');
    
    data = await runBrewWorkerGet((api) => { return api.getCSVFromSheets("fakegooglesheetid"); });
    expect(data.fname).toBe('getCSVFromSheets');
});

const runBrewWorkerAndIntendToError = (command) => {
    return new Promise((resolve, reject) => {
        const context = new ContextFacade((data) => {
            reject()
        });
        const api = new ScriptAPIWorker(context);
        try {
            command(api);
        } catch (error) {
            resolve(error);
        }
    });
};

test('Verify we can issue validation errors in expected contexts', async ()=>{
    let data = null;

    // Missing 1 parameter
    data = await runBrewWorkerAndIntendToError((api) => { api.doReplaceBetween("start", "end"); });
    expect(data instanceof ScriptValidationError).toBe(true);

    // Too many parameters, including over optional parameters
    data = await runBrewWorkerAndIntendToError((api) => { api.doReportError("error", "stack", "excess"); });
    expect(data instanceof ScriptValidationError).toBe(true);
    
    // Second parameter should be a number, not a string
    data = await runBrewWorkerAndIntendToError((api) => { api.getCSVFromSheets("fakegooglesheetid", "1"); });
    expect(data instanceof ScriptValidationError).toBe(true);

    // We can run an untrusted validation and it catches a specific validation error (google id ill-formed)
    expect(() => {
        const validator = new ScriptAPIValidator();
        validator.validateUntrustedFunction('getCSVFromSheets', ["/illformed", 1, "message"]);
    }).toThrow(`getCSVFromSheets: URL is ill-formed`);
});

test('brewScriptsToJSON can run at all', async ()=>{
    const data = brewScriptsToJSON("testmenu", `

`);
    expect(data.scripts.length).toBe(0);
});
