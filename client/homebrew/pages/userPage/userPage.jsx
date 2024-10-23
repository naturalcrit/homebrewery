const React = require('react');
const { useState, useEffect } = require('react');
const _ = require('lodash');

const ListPage = require('../basePages/listPage/listPage.jsx');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const VaultNavitem = require('../../navbar/vault.navitem.jsx');

const UserPage = (props) => {
    const { username = '', brews = [], query = '', error = null } = props;
    const usernameWithS = username + (username.endsWith('s') ? `’` : `’s`);

    const groupedBrews = _.groupBy(brews, (brew) => {
        return brew.published ? 'published' : 'private';
    });

	const brewCollection = [
		{
			title: `${usernameWithS} published brews`,
			class: 'published',
			brews: groupedBrews.published || []
		},
		...(username === global.account?.username ? [{
			title: `${usernameWithS} unpublished brews`,
			class: 'unpublished',
			brews: groupedBrews.private || []
		}] : [])
	];	

    const [currentError, setCurrentError] = useState(error);

    const errorReported = (error) => {
        setCurrentError(error);
    };

    const navItems = () => (
        <Navbar>
            <Nav.section>
                {currentError && (<ErrorNavItem error={currentError} parent={null}></ErrorNavItem>)}
                <NewBrew />
                <HelpNavItem />
                <VaultNavitem />
                <RecentNavItem />
                <Account />
            </Nav.section>
        </Navbar>
    );

    return (
        <ListPage brewCollection={brewCollection}  navItems={navItems()} query={query} reportError={errorReported}
        />
    );
};

module.exports = UserPage;
