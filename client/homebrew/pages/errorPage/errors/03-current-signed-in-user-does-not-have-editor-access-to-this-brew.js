const dedent = require('dedent-tabs').default;


export default function error03(props) {
	return {
		title : 'Current signed-in user does not have editor access to this brew.',
		text  : dedent`
            If you believe you should have access to this brew, ask one of its authors to invite you
            as an author by opening the Edit page for the brew, viewing the {{fa,fa-info-circle}}
            **Properties** tab, and adding your username to the "invited authors" list. You can
            then try to access this document again.
            
            :

            **Brew Title:** ${escape(props.brew.brewTitle) || 'Unable to show title'}

            **Current Authors:** ${props.brew.authors?.map((author)=>{return `[${author}](/user/${author})`;}).join(', ') || 'Unable to list authors'}
            
            [Click here to be redirected to the brew's share page.](/share/${props.brew.shareId})
`,
		image : { uri: null, attribution: null }
	};
}
