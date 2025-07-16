// Derived from the vue-html-secure package, customized for Homebrewery

let doc = null;
let div = null;

function safeHTML(htmlString) {
	// If the Document interface doesn't exist, exit
	if(typeof document == 'undefined') return null;
	// If the test document and div don't exist, create them
	if(!doc) doc = document.implementation.createHTMLDocument('');
	if(!div) div = doc.createElement('div');

	// Set the test div contents to the evaluation string
	div.innerHTML = htmlString;
	// Grab all nodes from the test div
	const elements = div.querySelectorAll('*');

	// Blacklisted tags
	const blacklistTags = ['script', 'noscript', 'noembed'];
	// Tests to remove attributes
	const blacklistAttrs = [
		(test)=>{return test.localName.indexOf('on') == 0;},
		(test)=>{return test.localName.indexOf('type') == 0 && test.value.match(/submit/i);},
		(test)=>{return test.value.replace(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g, '').toLowerCase().trim().indexOf('javascript:') == 0;}
	];


	elements.forEach((element)=>{
		// Check each element for blacklisted type
		if(blacklistTags.includes(element?.localName?.toLowerCase())) {
			element.remove();
			return;
		}
		// Check remaining elements for blacklisted attributes
		for (const attribute of element.attributes){
			if(blacklistAttrs.some((test)=>{return test(attribute);})) {
				element.removeAttribute(attribute.localName);
				break;
			};
		};
	});

	return div.innerHTML;
};

module.exports.safeHTML = safeHTML;