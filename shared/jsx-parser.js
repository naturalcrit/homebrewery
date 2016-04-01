var WHITESPACE = /(\s|\t|\n)/g;
var NUMBERS = /[0-9]/;
var LETTERS = /[a-zA-Z_]/;


var tokenMap = {
	//'<' : 'brace',
	//'>' : 'brace',
	'/' : 'close',
	'=' : 'equals',
}


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

		if(char == '>'){
			inTag = false;
			tokens.push({
				type : 'closeTag'
			})
			current++;
			continue;
		}

		if(char == '/' && input[current+1] == '>'){
			inTag = false;
			tokens.push({
				type : 'endTag'
			})
			current++;
			current++;
			continue;
		}


		if(tokenMap[char]){
			tokens.push({
				type : tokenMap[char],
				value : char
			});
			current++;
			continue;
		}

		if(WHITESPACE.test(char)){
			current++;
			continue;
		}

		if(NUMBERS.test(char)){
			tokens.push({
				type : 'number',
				value : getToken(NUMBERS)*1
			});
			continue;
		}

		if(LETTERS.test(char)){
			tokens.push({
				type : 'word',
				value : getToken(LETTERS)
			});
			continue;
		}

		if(char == "'"){
			char = input[++current]
			tokens.push({
				type : 'word',
				value : getToken(/[^\']/)
			});
			current++;
			continue;
		}
		if(char == '"'){
			char = input[++current]
			tokens.push({
				type : 'word',
				value : getToken(/[^\"]/)
			});
			current++;
			continue;
		}

		if(char == '<'){
			inTag = true;
			if(input[current+1] == '/'){
				char = input[++current]
				char = input[++current]
				//parse end element

				//console.log(char, getToken(LETTERS));
				tokens.push({
					type : 'endTag',
					value : getToken(LETTERS)
				})
				current++;
			}else{
				char = input[++current];
				tokens.push({
					type : 'openTag',
					value : getToken(LETTERS)
				})
			}
			current++;
			continue;
		}

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
		continue;
	}

	return tokens;

}






var parser = function(tokens){
	var nodes = [];
	var current = 0;
	var token = tokens[current];

	var getProps = function(){
		var props = {};
		var key = null;
		var temp = null;

		while(token.type != 'endTag' && token.type != 'closeTag' && current < tokens.length){
			if(temp && token.type == 'equals'){
				key = temp;
				temp = null;
				token = tokens[++current];
				continue;
			}
			if(key){
				props[key] = token.value;
				key = null;
				temp = null;
				token = tokens[++current];
				continue;
			}

			if(temp){
				props[temp] = true;
			}
			temp = token.value;
			token = tokens[++current];
		}
		return props;
	}


	var genNode = function(type){
		token = tokens[++current];
		var node = {
			type : type,
			props : getProps(),
			children : []
		}
		//grab props

		//search for children
		//return them

		var children = [];
		while(token.type != 'endTag' && token.value != 'type' && current < tokens.length){

			if(token.type == 'openTag'){
				children.push(genNode(token.value));
			}
			token = tokens[++current];
		}

		node.children = children;

		return node
	}


	//get an open tag
	//grab the props



	return getProps();


}












var tokens = tokenizer(`
<div test="here there 'champ'" more_cool size=0>
	<span></span>
</div>
<a href='neato'></a>
`);

console.log(tokens);


console.log(parser(tokens));



module.exports = tokenizer;



