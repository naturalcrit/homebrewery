const dedent = require('dedent-tabs').default;


export default function error11(props) {
	return {
		title : 'No Homebrewery document could be found.',
		text  : dedent`
            
            The server could not locate the Homebrewery document. The Brew ID failed the validation check.
            
            :

            **Brew ID:**  ${props.brew.brewId}
`,
		image : { uri: null, attribution: null }
	};
}
