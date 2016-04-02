var WHITESPACE = /(\s|\t|\n|\r)/g;
var NUMBERS = /[0-9]/;
var LETTERS = /[a-zA-Z_]/;

var tokenizer = function(input){
	var tokens = [];
	var current = 0;
	var inTag = false;

	while(current < input.length){
		var char = input[current];

		var getToken = function(regex){
			var value = '';
			while(regex.test(char) && current < input.length){
				value += char;
				char = input[++current];
			}
			return value;
		}

		if(inTag){
			if(char == '>'){
				inTag = false;
				tokens.push({
					type : 'closeTag'
				})
			}
			else if(char == '/' && input[current+1] == '>'){
				inTag = false;
				tokens.push({
					type : 'endTag'
				})
				current++;
			}
			else if(char == '='){
				tokens.push({
					type : 'equals'
				});
			}
			else if(WHITESPACE.test(char)){

			}
			else if(NUMBERS.test(char)){
				tokens.push({
					type : 'number',
					value : getToken(NUMBERS)*1
				});
				current--;
			}
			else if(LETTERS.test(char)){
				var word = getToken(LETTERS);
				if(word == 'true' || word == 'false'){
					tokens.push({
						type : 'boolean',
						value : word == 'true'
					});
				}else{
					tokens.push({
						type : 'word',
						value : word
					});
				}
				current--;
			}
			else if(char == "'"){
				char = input[++current]
				tokens.push({
					type : 'text',
					value : getToken(/[^\']/)
				});
			}
			else if(char == '"'){
				char = input[++current]
				tokens.push({
					type : 'text',
					value : getToken(/[^\"]/)
				});
			}
		}
		//Not tokenizing a tag definition
		else{
			//End tag
			if(char == '<' && input[current+1] == '/'){
				char = input[++current]
				char = input[++current]
				tokens.push({
					type : 'endTag',
					value : getToken(LETTERS)
				})
			}
			else if(char == '<'){
				inTag = true;
				char = input[++current];
				tokens.push({
					type : 'openTag',
					value : getToken(LETTERS)
				})
				current--;
			}
			else{
				//Handle slush text
				var value = '';
				while(char != '<' && current < input.length){
					value += char;
					char = input[++current];
				}
				value = value.trim()
				if(value){
					tokens.push({
						type : 'text',
						value : value
					});
				}
				current--;
			}
		}
		current++;
	}
	return tokens;
}

var parser = function(tokens){
	var nodes = [];
	var current = 0;
	var token = tokens[current];

	var parseProps = function(){
		var props = {};
		var key = null;
		var last = null;

		while(current < tokens.length && token.type != 'endTag' && token.type != 'closeTag'){
			if(last && token.type == 'word'){
				props[last] = true;
				last = token.value;
			}else if(!key && token.type == 'word'){
				last = token.value;
			}else if(last && token.type == 'equals'){
				key = last;
				last = null;
			}else if(key && (token.type == 'number' || token.type == 'text' || token.type == 'boolean')){
				props[key] = token.value;
				key = null;
				last = null;
			}else{
				throw "Invalid property value: " + key + '=' + token.value;
			}
			token = tokens[++current];
		}
		if(last) props[last] = true;

		return props;
	}

	var genNode = function(tagType){
		token = tokens[++current];
		var node = {
			tag : tagType,
			props : parseProps(),
			children : getChildren(tagType)
		}
		return node
	}

	var getChildren = function(tagType){
		var children = [];
		while(current < tokens.length){
			if(token.type == 'endTag'){
				if(token.value && token.value != tagType){
					throw "Invalid closing tag: " + token.value + ". Expected closing tag of type: " + tagType
				}else{
					break;
				}
			}
			if(token.type == 'openTag'){
				children.push(genNode(token.value));
			}else if(token.type == 'text'){
				children.push(token.value);
			}
			token = tokens[++current];
		}
		return children;
	}
	return getChildren();
}



/*
var test1 = `
<div test="hey there champ" more_cool=false size=0>
	<span>
		Hey there!
		<a>so fucking cool </a>
	</span>
	let's go party
	<a href='neato' />
</div>
`

var test2 = "<div cool=0 same>Hey there!</div>"


var tokens = tokenizer(test1);

console.log(test1, '\n---\n', tokens, '---\n', JSON.stringify(parser(tokens), null, '  '));
*/

module.exports = function(input){
	return parser(tokenizer(input));
}



