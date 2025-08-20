require('./editPage.less');
const React = require('react');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../../navbar/navbar.jsx');
const NewBrewItem = require('../../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../../navbar/help.navitem.jsx');
const PrintNavItem = require('../../../navbar/print.navitem.jsx');
const ErrorNavItem = require('../../../navbar/error-navitem.jsx');
const AccountNavItem = require('../../../navbar/account.navitem.jsx');
const RecentNavItem = require('../../../navbar/recent.navitem.jsx').both;
const VaultNavItem = require('../../../navbar/vault.navitem.jsx');

const BaseEditPage = (props)=>{
	return (
		<div className={`sitePage ${props.className || ''}`}>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{props.brew.title}</Nav.item>
				</Nav.section>
				<Nav.section>
					{props.navButtons}
					<PrintNavItem />
					<NewBrewItem />
					<HelpNavItem />
					<VaultNavItem />
					<RecentNavItem brew={props.brew} storageKey={props.recentStorageKey} />
					<AccountNavItem />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<SplitPane onDragFinish={handleSplitMove}>
					<Editor
						ref={editorRef}
						brew={brew}
						onTextChange={handleTextChange}
						onStyleChange={handleStyleChange}
						onMetaChange={handleMetaChange}
						renderer={brew.renderer}
						showEditButtons={false}  //FALSE FOR HOME PAGE
						userThemes={props.userThemes}
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
						theme={brew.theme}
						errors={htmlErrors}
						lang={brew.lang}
						onPageChange={handleBrewRendererPageChange}
						currentEditorViewPageNum={currentEditorViewPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						currentBrewRendererPageNum={currentBrewRendererPageNum}
						themeBundle={themeBundle}
						allowPrint={true} // FALSE FOR HOME PAGE
					/>
				</SplitPane>
			</div>

			{props.children?.(welcomeText, brew.text, save)}
		</div>
	);	
};

module.exports = BaseEditPage;
