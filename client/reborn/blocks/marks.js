// Inline marks live in their own module because they're cross-cutting: every
// text-bearing manifest uses them, but no manifest *owns* them. The registry
// pulls them in alongside the node specs.

export const marks = {
	strong : {
		parseDOM : [{ tag: 'strong' }, { tag: 'b' }],
		toDOM    : ()=>['strong', 0],
	},
	em : {
		parseDOM : [{ tag: 'em' }, { tag: 'i' }],
		toDOM    : ()=>['em', 0],
	},
	underline : {
		parseDOM : [{ tag: 'u' }, { style: 'text-decoration=underline' }],
		toDOM    : ()=>['u', 0],
	},
	link : {
		attrs     : { href: { default: '' }, title: { default: null } },
		inclusive : false,
		parseDOM  : [{
			tag      : 'a[href]',
			getAttrs : (dom)=>({
				href  : dom.getAttribute('href') || '',
				title : dom.getAttribute('title'),
			}),
		}],
		toDOM : (mark)=>{
			const a = { href: mark.attrs.href };
			if(mark.attrs.title) a.title = mark.attrs.title;
			return ['a', a, 0];
		},
	},
	code : {
		parseDOM : [{ tag: 'code' }],
		toDOM    : ()=>['code', 0],
	},
	color : {
		attrs    : { color: { default: '' } },
		parseDOM : [{
			tag      : 'span[data-color]',
			getAttrs : (dom)=>({ color: dom.getAttribute('data-color') || '' }),
		}],
		toDOM : (mark)=>['span', {
			style        : `color: ${mark.attrs.color}`,
			'data-color' : mark.attrs.color,
		}, 0],
	},
};
