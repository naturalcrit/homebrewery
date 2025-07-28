require('./DialogZone.less');
const React = require('react');


const DialogZone = ({id = '', children, ...props})=>{
	return <div id={id} className={`dialog-zone ${props.className || ''}`}>
		{children}
	</div>;
};

module.exports = DialogZone;