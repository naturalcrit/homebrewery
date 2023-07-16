require('./modal.less');
const React = require('react');
const createClass = require('create-react-class');

const Modal = createClass({
	getDefaultProps : function () {
		return {
			header : '',
			save   : ()=>{},
		};
	},

	getInitialState : function() {
		return {
			visible : false,
		};
	},

	setVisible : function(visible) {
		this.setState({
			visible
		});
	},

	save : function() {
		this.props.save();
		this.setVisible(false);
	},

	render : function () {
		const { children, header } = this.props;
		const { visible } = this.state;
		return <React.Fragment>
			{visible ? <div className={'bg-cover'}>
				<div className={'modal'}>
					<h1>{header}</h1>
					<hr/>
					{children}
					<div className={'action-row'}>
						<button id={'save'} onClick={()=>this.save()}>Save</button>
						<button id={'cancel'} onClick={()=>this.setVisible(false)}>Cancel</button>
					</div>
				</div>
			</div> : null}
		</React.Fragment>;
	}
});

module.exports = Modal;