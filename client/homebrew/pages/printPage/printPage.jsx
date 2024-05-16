require('./printPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const BREWKEY = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY = 'homebrewery-new-meta';

const PrintPage = createClass({
	displayName     : 'PrintPage',
	getDefaultProps : function() {
		return {
			query : {},
			brew  : {
				text     : '',
				style    : '',
				renderer : 'legacy',
				lang     : ''
			}
		};
	},

	getInitialState : function() {
		return {
			brew : {
				text     : this.props.brew.text     || '',
				style    : this.props.brew.style    || undefined,
				renderer : this.props.brew.renderer || 'legacy',
				theme    : this.props.brew.theme    || '5ePHB',
				lang   	 : this.props.brew.lang     || 'en'
			}
		};
	},

	componentDidMount : function() {
		if(this.props.query.local == 'print'){
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const metaStorage = JSON.parse(localStorage.getItem(METAKEY));

			this.setState((prevState, prevProps)=>{
				return {
					brew : {
						text     : brewStorage,
						style    : styleStorage,
						renderer : metaStorage?.renderer || 'legacy',
						theme    : metaStorage?.theme    || '5ePHB',
						lang   	 : metaStorage?.lang	 || 'en'
					}
				};
			});
		}
	},

	frameMounted : function() {
		if(this.props.query.dialog) window.print();
	},

	render : function(){
		return <div className='printPage'>
			<BrewRenderer
				text={this.state.brew.text}
				style={this.state.brew.style}
				renderer={this.state.brew.renderer}
				theme={this.state.brew.theme}
				errors={undefined}
				lang={this.state.brew.lang}
				currentEditorPage={1}
				useIFrame={false}
				frameMounted={this.frameMounted}
			/>
		</div>;
	}
});

module.exports = PrintPage;
