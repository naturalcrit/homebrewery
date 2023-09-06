require('./modal.less');
const React = require('react');
const ReactDOMClient = require('react-dom/client');
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

module.exports = {
	/*
	* Requirements:
	* - modalRef member variable
	* - should be re-rendered via `this.state.modalRoot?.render` in `componentDidUpdate`
	*/
	Modal,
	modalHelpers : {
		// should be called in `componentDidMount`
		// `self` should be passed as the component instance (`this`)
		mount : (self)=>{
			const el = document.createElement('div');
			const root = ReactDOMClient.createRoot(el);
			document.querySelector('body').append(el);
			self.setState({
				el,
				modalRoot : root
			});
		},
		// should be called in `componentWillUnmount`
		// `self` should be passed as the component instance (`this`)
		unmount : (self)=>{
			self.state.el.remove();
		}
	}
};