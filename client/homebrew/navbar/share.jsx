const React = require('react');
const createClass = require('create-react-class');
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Dropdown from '@radix-ui/react-dropdown-menu';


const Share = createClass({
	displayName     : 'ShareMenu',
	getDefaultProps : function() {
		return {
			title     : '',
			shareLink : '',
			systems   : []
		};
	},

	getRedditLink : function() {
		const systems = this.props.systems.length > 0 ? ` [${this.props.systems.join(' - ')}]` : '';
		const title = `${this.props.title} ${systems}`;
		const text = `Hey folks! I've been working on this homebrew. I'd love your feedback. Check it out.
	
	**[Homebrewery Link](${global.config.publicUrl}/share/${this.props.shareLink})**`;

		return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
	},

	render : function(props){
		return <Dropdown.Root>
			<Toolbar.Button asChild>
				<Dropdown.Trigger>Share</Dropdown.Trigger>
			</Toolbar.Button>
			<Dropdown.Portal>
				<Dropdown.Content>
					<Toolbar.Link target='_blank' href={`/share/${this.props.shareLink}`}>View</Toolbar.Link>
					<Toolbar.Link target='_blank' href={`/share/${this.props.shareLink}`}>Share URL</Toolbar.Link>
					<Toolbar.Link target='_blank' href={this.getRedditLink()}>Post to Reddit</Toolbar.Link>
				</Dropdown.Content>
			</Dropdown.Portal>
		</Dropdown.Root>;
	}


});

module.exports = Share;