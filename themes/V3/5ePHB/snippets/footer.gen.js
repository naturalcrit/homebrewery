module.exports = function(brew, params){
	const cursorPos = params.cursorPos;
	const headerSize = params.headerSize || 1;

	let header='';
	while (header.length < headerSize) {
		header = header.concat('#');
	}
	header = header.concat(' ');

	const textArray = brew.text.split('\n').slice(0, cursorPos.line).reverse();
	const textArrayFilter = textArray.filter((line)=>{ return line.slice(0, header.length) == header; });
	const text = textArrayFilter[0]?.slice(header.length) || 'PART 1 | SECTION NAME';

	return `\n{{footnote ${text}}}\n`;
};