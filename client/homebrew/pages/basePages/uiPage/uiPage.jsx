import './uiPage.less';
import Nav from '../../../navbar/nav.jsx';
import Navbar from '../../../navbar/navbar.jsx';
import NewBrewItem from '../../../navbar/newbrew.navitem.jsx';
import HelpNavItem from '../../../navbar/help.navitem.jsx';
import RecentNavItems from '../../../navbar/recent.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import Account from '../../../navbar/account.navitem.jsx';

const UIPage = ({brew, children})=>{

	return <div className='sitePage uiPage'>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{brew?.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<NewBrewItem />
					<HelpNavItem />
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				{children}
			</div>
		</div>;
};

export default UIPage;
