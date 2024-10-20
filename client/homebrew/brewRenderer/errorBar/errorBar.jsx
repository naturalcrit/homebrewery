require('./errorBar.less');
const React = require('react');
const _ = require('lodash');

import Dialog from '../../../components/dialog.jsx';


const DISMISS_BUTTON = <i className='fas fa-times dismiss' />;

const ErrorBar = ( props ) => {
    let hasOpenError = false;
    let hasCloseError = false;
    let hasMatchError = false;

    const renderErrors = () => {
        hasOpenError = false;
        hasCloseError = false;
        hasMatchError = false;

        const errors = _.map(props.errors, (err, idx) => {
            if (err.id === 'OPEN') hasOpenError = true;
            if (err.id === 'CLOSE') hasCloseError = true;
            if (err.id === 'MISMATCH') hasMatchError = true;

            return (
                <li key={idx}>
                    Line {err.line} : {err.text}, '{err.type}' tag
                </li>
            );
        });

        return <ul>{errors}</ul>;
    };

    const renderProtip = () => {
        const msg = [];
        if (hasOpenError) {
            msg.push(
                <div key="openError">
                    An unmatched opening tag means there's an opened tag that isn't closed. You need to close your tags, like this {'</div>'}. Make sure to match types!
                </div>
            );
        }

        if (hasCloseError) {
            msg.push(
                <div key="closeError">
                    An unmatched closing tag means you closed a tag without opening it. Either remove it, or check to where you think you opened it.
                </div>
            );
        }

        if (hasMatchError) {
            msg.push(
                <div key="matchError">
                    A type mismatch means you closed a tag, but the last open tag was a different type.
                </div>
            );
        }

        return (
            <div className="protips">
                <h4>Protips!</h4>
                {msg}
            </div>
        );
    };

    if (!props.errors.length) return null;

    return (
        <Dialog className="errorBar" closeText={DISMISS_BUTTON} >
			<div className="content">
				<i className="fas fa-exclamation-triangle" />
				<h3> There are HTML errors in your markup</h3>
            	<small>
                	If these aren't fixed your brew will not render properly when you print it to PDF or share it
            	</small>
            	{renderErrors()}
			</div>
            <hr />
            {renderProtip()}
        </Dialog>
	);
};

module.exports = ErrorBar;
