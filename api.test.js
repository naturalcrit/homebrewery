const request = require('superagent');
const brewData = require('./server/brew.data.js');

const path = 'localhost:8000';

request.post(`${path}/api/brew`)
	.send({
		text : 'new brew'
	})
	.end((err, res) => {
		console.log(err, res && res.body);

		console.log('creaitng brew');

		//creating brew
		brewData.create({
			text : 'yeah yeah'
		})
			.then((brew) => {
				console.log(brew);
			})
			.catch((e) => {
				console.log(e);
			})

		/*
		res.body.text = 'check it';
		brewData.update(res.body)
			.then((newBrew) => {
				console.log(newBrew);
			})
			.catch((e) => {
				console.log(e);
			})
		*/
	})

