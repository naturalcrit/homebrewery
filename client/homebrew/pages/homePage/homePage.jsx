require('./homePage.less');
const React = require('react');
const createClass = require('create-react-class');
const cx = require('classnames');
import request from '../../utils/request-middleware.js';
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const { fetchThemeBundle } = require('../../../../shared/helpers.js');

const BaseEditPage = require('../basePages/editPage/editPage.jsx');
const SplitPane = require('client/components/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW } = require('../../../../server/brewDefaults.js');

const HomePage = createClass({
	displayName     : 'HomePage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW
		};
	},

	editor : React.createRef(null),

	componentDidMount : function() {
		fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);
	},

	save : function(){
		this.setState({
			isSaving : true
		});

		request.post('/api')
			.send(this.state.brew)
			.end((err, res)=>{
				if(err) {
					this.setState({ error: err });
					return;
				}
				const brew = res.body;
				window.location = `/edit/${brew.editId}`;
			})
			.catch((err)=>{
				this.setState({ isSaving: false, error: err });
			});
	},
	handleSplitMove : function(){
		this.editor.current.update();
	},

	handleEditorViewPageChange : function(pageNumber){
		this.setState({ currentEditorViewPageNum: pageNumber });
	},

	handleEditorCursorPageChange : function(pageNumber){
		this.setState({ currentEditorCursorPageNum: pageNumber });
	},

	handleBrewRendererPageChange : function(pageNumber){
		this.setState({ currentBrewRendererPageNum: pageNumber });
	},

	handleTextChange : function(text){
		this.setState((prevState)=>({
			brew : { ...prevState.brew, text: text },
		}));
	},

	renderSaveButton : function(){
		if(this.state.isSaving){
			return <Nav.item icon='fas fa-spinner fa-spin' className='save'>
				save...
			</Nav.item>;
		} else {
			return <Nav.item icon='fas fa-save' className='save' onClick={this.save}>
				save
			</Nav.item>;
		}
	},

	renderNavbar : function(){
		return <>
			<Nav.section>
				{this.state.error ?
					<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
					null
				}
			</Nav.section>
			</>;
	},

	render : function(){
		return <BaseEditPage
							className="homePage"
							errorState={this.state.error}
							parent={this}
							performSave={this.save}
						>
						{(welcomeText, brewText, save) => {
							return <>
								<Meta name='google-site-verification' content='NwnAQSSJZzAT7N-p5MY6ydQ7Njm67dtbu73ZSyE5Fy4' />
								<div className={cx('floatingSaveButton', { show: welcomeText != brewText })} onClick={save}>
									Save current <i className='fas fa-save' />
								</div>

								<a href='/new' className='floatingNewButton'>
									Create your own <i className='fas fa-magic' />
								</a>
							</>
						}}
					</BaseEditPage>
	}
});

module.exports = HomePage;
