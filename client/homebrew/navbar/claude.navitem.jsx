import React, { useState } from 'react';
import Nav from './nav.jsx';
import ClaudeModal from './claudeModal/claudeModal.jsx';

export default function ClaudeNavItem({ brew, onInsert }){
	const [isOpen, setIsOpen] = useState(false);

	return <>
		<Nav.item
			color='purple'
			icon='fas fa-robot'
			onClick={()=>setIsOpen(true)}
		>
			AI assist
		</Nav.item>
		{isOpen && (
			<ClaudeModal
				brew={brew}
				onInsert={onInsert}
				onClose={()=>setIsOpen(false)}
			/>
		)}
	</>;
}
