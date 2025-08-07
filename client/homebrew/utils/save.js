import { makePatches, stringifyPatches } from '@sanity/diff-match-patch';
import { gzipSync, strToU8 } from 'fflate';
import { md5 } from 'hash-wasm';
import request from './request-middleware.js';

export async function saveBrew({
	mode, // 'edit' or 'new'
	brew,
	savedBrew,
	saveGoogle,
	onSuccess,
	onError,
}) {
	try {
		const brewToSend = { ...brew };
		brewToSend.text = brewToSend.text.normalize('NFC');
		brewToSend.pageCount = ((brewToSend.renderer === 'legacy'
			? brewToSend.text.match(/\\page/g)
			: brewToSend.text.match(/^\\page$/gm)) || []).length + 1;

		let url, method, params = '';
		if(mode === 'edit') {
			savedBrew.text = savedBrew.text.normalize('NFC');
			brewToSend.patches = stringifyPatches(makePatches(savedBrew.text, brewToSend.text));
			brewToSend.hash = await md5(savedBrew.text);
			brewToSend.textBin = undefined;
			const transfer = saveGoogle == null ? false : saveGoogle == null;
			params = transfer ? `?${saveGoogle ? 'saveToGoogle' : 'removeFromGoogle'}=true` : '';
			url = `/api/update/${brewToSend.editId}${params}`;
			method = 'put';
		} else {
			url = `/api${saveGoogle ? '?saveToGoogle=true' : ''}`;
			method = 'post';
		}

		const compressed = gzipSync(strToU8(JSON.stringify(brewToSend)));
		const res = await request[method](url)
            .set('Content-Encoding', 'gzip')
            .set('Content-Type', 'application/json')
            .send(compressed);

		onSuccess?.(res);
		return res;
	} catch (err) {
		onError?.(err);
		return null;
	}
}