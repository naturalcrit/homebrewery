var WHITESPACE = /(\s|\t|\n)/g;
var NUMBERS = /[0-9]/;
var LETTERS = /[a-zA-Z_]/;


var tokenMap = {
	//'<' : 'brace',
	//'>' : 'brace',
	//'/' : 'close',
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
				continue;
			}

			else if(LETTERS.test(char)){
				tokens.push({
					type : 'word',
					value : getToken(LETTERS)
				});
				continue;
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

		//Not in a tag def
		else{

			//End tag
			if(char == '<' && input[current+1] == '/'){
				char = input[++current]
				char = input[++current]
				tokens.push({
					type : 'endTag',
					value : getToken(LETTERS)
				})
				//current++;
			}
			else if(char == '<'){
				inTag = true;
				char = input[++current];
				tokens.push({
					type : 'openTag',
					value : getToken(LETTERS)
				})
				console.log(char);
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


	var genNode = function(tagType){
		token = tokens[++current];
		var node = {
			tag : tagType,
			props : getProps(),
			children : getChildren(tagType)
		}
		return node
	}

	var getChildren = function(tagType){
		var children = [];
		while(current < tokens.length && token.type != 'endTag' && token.value != tagType){
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




var test1 = `
why you so cray
<div test="here there 'champ'" more_cool size=0>
	<span>Hey there!<a>so fucking cool</a></span>
	let's go party!@
	we be cray
</div>
<a href='neato' />
`

var test2 = "<div>Hey there!</div>"







var tokens = tokenizer(test1);

console.log(tokens);


console.log(test1, JSON.stringify(parser(tokens), null, '  '));



module.exports = tokenizer;



