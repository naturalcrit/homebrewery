const less = require('less');
const fs = require('fs');

less.render(fs.readFileSync('./client/homebrew/phbStyle/phb.style.less', 'utf8'), { compress: true })
	.then((output)=>{
		fs.writeFileSync('./phb.standalone.css', output.css);
		console.log('phb.standalone.css created!');
	}, (err)=>{
		console.error(err);
	});