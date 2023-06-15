module.exports = {
	createFooterFunc : function(headerSize=1){
		return (props)=>{
			const cursorPos = props.cursorPos;

			let header='';
			while (header.length < headerSize) {
				header = header.concat('#');
			}
			header = header.concat(' ');

			const textArray = props.brew.text.split('\n').slice(0, cursorPos.line).reverse();
			const textArrayFilter = textArray.filter((line)=>{ return line.slice(0, header.length) == header; });
			const text = textArrayFilter[0]?.slice(header.length).trim() || 'PART 1 | SECTION NAME';

			return `\n{{footnote ${text}}}\n`;
		};
	}
};