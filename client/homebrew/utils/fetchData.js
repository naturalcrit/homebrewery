

import request from './request-middleware';

import { splitTextStyleAndMetadata } from '../../../shared/helpers';
import { DEFAULT_BREW } from '../../../server/brewDefaults';

const fetchData = async (
	id = null,
	type = 'share',
	title = '',
	setData = ()=>{},
	setError = ()=>{},
)=>{

	let brewData;

	const data = await request
				.get(`/api/${type}/${id}`)
				.catch((err)=>{
					return err.response;
				});

	if(type == 'text') {
		brewData = Object.assign(DEFAULT_BREW, { text: data.text, title: title });
	} else {
		brewData = data.body;
	}

	if(!data.ok) {
		setError(brewData);
		return;
	}

	splitTextStyleAndMetadata(brewData);

	setData(brewData);
};

export default fetchData;