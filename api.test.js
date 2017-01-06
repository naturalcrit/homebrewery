const request = require('superagent');
const path = 'localhost:8000';

request.post(`${path}/api/brew`)
	.send({
		text : 'new brew'
	})
	.end((err, res) => {
		console.log(err, res && res.body);
	});


/////////

const db = require('./server/db.js');
const brewData = require('./server/brew.data.js');


db.connect()
	.then(()=>{
		brewData.create({
			text : 'test'
		})
		.then((brew)=>{
			console.log(brew);
		})
	})