require('./homePage.less');
const React = require('react');
const createClass = require('create-react-class');
const cx = require('classnames');
import request from '../../utils/request-middleware.js';
const { Meta } = require('vitreum/headtags');

import MainNavigationBar from 'client/homebrew/navbar/mainNavigationBar.jsx';

const { fetchThemeBundle } = require('../../../../shared/helpers.js');

const { SplitPane } = require('client/components/splitPane/splitPane.jsx');
const ScrollButtons = require('client/components/splitPane/dividerButtons/scrollButtons.jsx');
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
	getInitialState : function() {
		return {
			brew                       : this.props.brew,
			welcomeText                : this.props.brew.text,
			error                      : undefined,
			currentEditorViewPageNum   : 1,
			currentEditorCursorPageNum : 1,
			currentBrewRendererPageNum : 1,
			themeBundle                : {},
			paneOrder                  : [0, 1],
		};
	},

	editor : React.createRef(null),

	componentDidMount : function() {
		fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);
	},

	handleSave : function(){
		request.post('/api')
			.send(this.state.brew)
			.end((err, res)=>{
				if(err) {
					this.setState({ error: err });
					return;
				}
				const brew = res.body;
				window.location = `/edit/${brew.editId}`;
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

	render : function(){
		return <div className='homePage sitePage'>
			<Meta name='google-site-verification' content='NwnAQSSJZzAT7N-p5MY6ydQ7Njm67dtbu73ZSyE5Fy4' />
			<MainNavigationBar alerts={null} brew={this.state.brew}/>
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove}
					paneOrder={this.state.paneOrder}
					setPaneOrder={(order)=>this.setState({ paneOrder: order })}
					dividerButtons={ScrollButtons({
						paneOrder          : this.state.paneOrder,
						editorRef          : this.editor,
						liveScroll         : this.state.liveScroll,
						onLiveScrollToggle : this.liveScrollToggle
					})}>
					<Editor
						ref={this.editor}
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						renderer={this.state.brew.renderer}
						showEditButtons={false}
						themeBundle={this.state.themeBundle}
						onCursorPageChange={this.handleEditorCursorPageChange}
						onViewPageChange={this.handleEditorViewPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
						liveScroll={this.state.liveScroll}
					/>
					<BrewRenderer
						text={this.state.brew.text}
						style={this.state.brew.style}
						renderer={this.state.brew.renderer}
						onPageChange={this.handleBrewRendererPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
						themeBundle={this.state.themeBundle}
					/>
				</SplitPane>
			</div>
			<div className={cx('floatingSaveButton', { show: this.state.welcomeText != this.state.brew.text })} onClick={this.handleSave}>
				Save current <i className='fas fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>
		</div>;
	}
});

module.exports = HomePage;
