const dedent = require('dedent-tabs').default;


export default function error10() {
	return {
		title : 'The selected theme is not tagged as a theme.',
		text  : dedent`
            The brew selected as a theme exists, but has not been marked for use as a theme with the \`theme:meta\` tag.
            
            If the selected brew is your document, you may designate it as a theme by adding the \`theme:meta\` tag.`,
		image : { uri: null, attribution: null }
	};
}
