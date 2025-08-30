require('./homePage.less');
const React = require('react');
const createClass = require('create-react-class');
const cx = require('classnames');
import request from '../../utils/request-middleware.js';
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const NewBrewItem = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');
const VaultNavItem = require('../../navbar/vault.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const AccountNavItem = require('../../navbar/account.navitem.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const { fetchThemeBundle } = require('../../../../shared/helpers.js');

const SplitPane = require('client/components/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW } = require('../../../../server/brewDefaults.js');

const HomePage =(props)=>{
	props = {
		brew : DEFAULT_BREW,
		ver  : '0.0.0',
    ...props
  };

	const [brew                      , setBrew]                       = useState(props.brew);
	const [welcomeText               , setWelcomeText]                = useState(props.brew.text);
	const [error                     , setError]                      = useState(undefined);
	const [currentEditorViewPageNum  , setCurrentEditorViewPageNum]   = useState(1);
	const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
	const [themeBundle               , setThemeBundle]                = useState({});

	const editorRef = useRef(null);

	useEffect(()=>{
		fetchThemeBundle(setError, setThemeBundle, brew.renderer, brew.theme);
	}, []);

	const handleSave = ()=>{
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
	};

	const handleSplitMove = ()=>{
		this.editor.current.update();
	};

	const handleEditorViewPageChange = (pageNumber)=>{
		this.setState({ currentEditorViewPageNum: pageNumber });
	};

	const handleEditorCursorPageChange = (pageNumber)=>{
		this.setState({ currentEditorCursorPageNum: pageNumber });
	};

	const handleBrewRendererPageChange = (pageNumber)=>{
		this.setState({ currentBrewRendererPageNum: pageNumber });
	};

	const handleTextChange = (text)=>{
		this.setState((prevState)=>({
			brew : { ...prevState.brew, text: text },
		}));
	};

	const renderNavbar = ()=>{
		return <Navbar ver={this.props.ver}>
			<Nav.section>
				{this.state.error ?
					<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
					null
				}
				<NewBrewItem />
				<HelpNavItem />
				<VaultNavItem />
				<RecentNavItem />
				<AccountNavItem />
			</Nav.section>
		</Navbar>;
	};

	return (
		<div className='homePage sitePage'>
			<Meta name='google-site-verification' content='NwnAQSSJZzAT7N-p5MY6ydQ7Njm67dtbu73ZSyE5Fy4' />
			{renderNavbar()}
			<div className='content'>
				<SplitPane onDragFinish={handleSplitMove}>
					<Editor
						ref={editorRef}
						brew={brew}
						onTextChange={handleTextChange}
						renderer={brew.renderer}
						showEditButtons={false}
						themeBundle={themeBundle}
						onCursorPageChange={handleEditorCursorPageChange}
						onViewPageChange={handleEditorViewPageChange}
						currentEditorViewPageNum={currentEditorViewPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						currentBrewRendererPageNum={currentBrewRendererPageNum}
					/>
					<BrewRenderer
						text={brew.text}
						style={brew.style}
						renderer={brew.renderer}
						onPageChange={handleBrewRendererPageChange}
						currentEditorViewPageNum={currentEditorViewPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						currentBrewRendererPageNum={currentBrewRendererPageNum}
						themeBundle={themeBundle}
					/>
				</SplitPane>
			</div>
			<div className={cx('floatingSaveButton', { show: welcomeText != brew.text })} onClick={handleSave}>
				Save current <i className='fas fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>
		</div>
	)
};

module.exports = HomePage;
