require('./image-selector.less');
const React = require('react');
const createClass = require('create-react-class');
const { Modal, modalHelpers } = require('../modal/modal.jsx');
const { PATTERNS } = require('../constants.js');
const CodeMirror = require('../../../code-mirror.js');
const _ = require('lodash');

const ImageSelector = createClass({
	modalRef : React.createRef(),

	getDefaultProps : function () {
		return {
			field : {},
			cm    : {},
			n     : undefined
		};
	},

	getInitialState : function() {
		return {
			selected : undefined,
		};
	},

	componentDidMount : function() {
		modalHelpers.mount(this);
	},

	componentDidUpdate : function() {
		const { name, preview, values } = this.props.field;
		const { selected } = this.state;

		const images = values.map((v, i)=>{
			const className = String(selected) === String(v) ? 'selected' : '';
			return <img key={i} className={className} src={preview(v)} alt={`${name} image ${v}`} onClick={()=>this.select(v)}/>;
		});

		this.state.modalRoot?.render(<Modal ref={this.modalRef} header={_.startCase(name)} save={this.save}>
			<div className={'images'}>
				{images}
			</div>
		</Modal>);
	},

	componentWillUnmount : function() {
		modalHelpers.unmount(this);
	},

	save : function() {
		const { cm, field, n } = this.props;
		const { text } = cm.lineInfo(n);
		const pattern = PATTERNS.field[field.type](field.name);
		const [fullmatch, label, current] = text.match(pattern);
		if(!fullmatch) {
			console.warn('something is wrong... please report this warning with a screenshot');
			return;
		}
		const currentText = `${label}${current ?? ''}`;
		const index = 2;
		const value = label + this.state.selected;
		cm.replaceRange(value, CodeMirror.Pos(n, index), CodeMirror.Pos(n, index + currentText.length), '+insert');
	},

	select : function(value) {
		this.setState({
			selected : value
		});
	},

	showModal : function() {
		const { cm, field, n } = this.props;
		const { text } = cm.lineInfo(n);
		const pattern = PATTERNS.field[field.type](field.name);
		const [fullmatch, _, current] = text.match(pattern);
		if(!fullmatch) {
			return;
		}
		this.setState({
			selected : current
		});
		this.modalRef.current.setVisible(true);
	},

	render : function () {
		return <React.Fragment>
			<button onClick={this.showModal}>Select Image</button>
		</React.Fragment>;
	}
});

module.exports = ImageSelector;