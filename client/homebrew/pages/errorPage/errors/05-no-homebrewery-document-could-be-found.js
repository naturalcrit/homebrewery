const dedent = require('dedent-tabs').default;

export default function error05(props) {
	return {
		title : 'No Homebrewery document could be found.',
		text  : dedent`            
            The server could not locate the Homebrewery document. It was likely deleted by
            its owner.
            
            :

            **Requested access:** ${props.brew.accessType}

            **Brew ID:**  ${props.brew.brewId}
`,
		image : { uri: null, attribution: null }
	};
}
