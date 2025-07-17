const React = require('react');
import Button from 'client/components/Button.jsx';

const ScrollButtons = ({
	paneOrder,
	editorRef,
	liveScroll,
	onLiveScrollToggle
})=>[
	<Button
		key='move-source'
		id='move-source'
		iconOnly
		icon={paneOrder[0] === 0 ? 'fas fa-arrow-left' : 'fas fa-arrow-right'}
		tooltipDirection={['right']}
		onClick={()=>editorRef.current.sourceJump()}
	>
        Jump to location in Editor
	</Button>,
	<Button
		key='move-preview'
		id='move-preview'
		iconOnly
		icon={paneOrder[0] === 0 ? 'fas fa-arrow-right' : 'fas fa-arrow-left'}
		tooltipDirection={['right']}
		onClick={()=>editorRef.current.brewJump()}
	>
        Jump to location in Preview
	</Button>,
	<Button
		key='scroll-lock'
		id='scroll-lock'
		role='switch'
		aria-checked={liveScroll ? 'true' : 'false'}
		tooltipDirection={['right']}
		iconOnly
		icon={liveScroll ? 'fas fa-lock' : 'fas fa-unlock'}
		onClick={onLiveScrollToggle}
	>
		{liveScroll ? 'Un-Sync Editor and Preview locations' : 'Sync Editor and Preview locations'}
	</Button>
];

module.exports = ScrollButtons;