const dedent = require('dedent-tabs').default;


export default function error51(props) {
	return {
		title : 'This brew has been locked.',
		text  : dedent`
            Only an author may request that this lock is removed.
            
            :

            **Brew ID:**  ${props.brew.brewId}
            
            **Brew Title:** ${escape(props.brew.brewTitle)}
            
            **Brew Authors:**  ${props.brew.authors?.map((author)=>{return `[${author}](/user/${author})`;}).join(', ') || 'Unable to list authors'}`,
		image : { uri: null, attribution: null }
	};
}
