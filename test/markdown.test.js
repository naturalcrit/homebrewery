const testing = require('./test.init.js');

const Markdown = require('../shared/homebrewery/markdown.new.js');

describe('Markdown', ()=>{

	it('should do a thing', ()=>{

		const res = Markdown.render(`
			test
			<div> cool stuff </div>
			test2
		`)
		console.log(res);



	});

});