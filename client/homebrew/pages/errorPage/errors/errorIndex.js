const dedent = require('dedent-tabs').default;

const loginUrl = 'https://www.naturalcrit.com/login';

const errorIndex = (props)=>{
	return {
		// Default catch all
		'00' : dedent`
			## Unbekannter Fehler!
			
			Es ist unklar, was passiert ist, aber der server konnte nicht finden, was du suchst.`,


		// User is not Authors list
		'03' : dedent`
		## Current signed-in user does not have editor access to this brew.

		If you believe you should have access to this brew, ask one of its authors to invite you
		as an author by opening the Edit page for the brew, viewing the {{fa,fa-info-circle}}
		**Properties** tab, and adding your username to the "invited authors" list. You can
		then try to access this document again.
		
		**Brew Title:** ${props.brew.brewTitle || 'Unable to show title'}

		**Current Authors:** ${props.brew.authors?.map((author)=>{return `${author}`;}).join(', ') || 'Unable to list authors'}`,

		// User is not signed in; must be a user on the Authors List
		'04' : dedent`
		## Sign-in required to edit this brew.
		
		You must be logged in to one of the accounts listed as an author of this brew.
		User is not logged in. Please log in [here](${loginUrl}).
		
		**Brew Title:** ${props.brew.brewTitle || 'Unable to show title'}

		**Current Authors:** ${props.brew.authors?.map((author)=>{return `${author}`;}).join(', ') || 'Unable to list authors'}`,

		// Brew load error
		'05' : dedent`
		## So ein Gebräu haben wir nicht.
		
		Ganz ehrlich. Ich hab alles durchsucht. Kein einziges Gebräu mit dieser **ID**: ${props.brew.brewId} (${props.brew.accessType}).`,

		// Brew save error
		'06' : dedent`
		## Ich konnte das Gebräu nicht sichern.
		
		Ohje, ich habe versucht es abzuspeichern, aber leider hats nicht geklappt. Ich weiß auch nicht warum.. *Hicks*`,

		// Brew delete error
		'07' : dedent`
		## Ich konnte das Gebräu nicht entfernen.
		
		Bei meinem Versuch ist ein Fehler aufgetreten. Es tut mir Leid.
		
		**Gebräu ID:**  ${props.brew.brewId}`,

		// Author delete error
		'08' : dedent`
		## Benutzers konnte nicht aus der Autorenliste des Gebräus gelöscht werden.
		
		Beim Löschen des Benutzers aus der Autorenliste des Gebräus trat ein Fehler auf!
		
		**Gebräu ID:**  ${props.brew.brewId}`,
	};
};

module.exports = errorIndex;