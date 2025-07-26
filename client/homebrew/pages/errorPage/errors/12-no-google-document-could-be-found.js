const dedent = require('dedent-tabs').default;


export default function error12(props) {
	return {
		title : 'No Google document could be found.',
		text  : dedent`
            The server could not locate the Google document. The Google ID failed the validation check.
            
            :

            **Brew ID:**  ${props.brew.brewId}`,
		image : { uri: null, attribution: null }
	};
}
