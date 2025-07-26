const dedent = require('dedent-tabs').default;


export default function error07(props) {
	return {
		title : 'Unable to delete Homebrewery document.',
		text  : dedent`            
            An error occurred while attempting to remove the Homebrewery document.
            
            :

            **Brew ID:**  ${props.brew.brewId}`,
		image : { uri: null, attribution: null }
	};
}
