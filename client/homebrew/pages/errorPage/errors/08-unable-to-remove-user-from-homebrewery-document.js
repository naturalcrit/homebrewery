const dedent = require('dedent-tabs').default;


export default function error08(props) {
	return {
		title : 'Unable to remove user from Homebrewery document.',
		text  : dedent`
            An error occurred while attempting to remove the user from the Homebrewery document author list!
            
            :

            **Brew ID:**  ${props.brew.brewId}`,
		image : { uri: null, attribution: null }
	};
}
