const dedent = require('dedent-tabs').default;


export default function error04(props) {
	return {
		title : 'Sign-in required to edit this brew.',
		text  : dedent`         
            You must be logged in to one of the accounts listed as an author of this brew.
            User is not logged in. Please log in [here](${loginUrl}).
            
            :

            **Brew Title:** ${escape(props.brew.brewTitle) || 'Unable to show title'}

            **Current Authors:** ${props.brew.authors?.map((author)=>{return `[${author}](/user/${author})`;}).join(', ') || 'Unable to list authors'}

            [Click here to be redirected to the brew's share page.](/share/${props.brew.shareId})
`,
		image : { uri: null, attribution: null }
	};
}
