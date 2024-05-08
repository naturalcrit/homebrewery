require('./archivePage.less');

const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');
const BrewItem = require('../basePages/listPage/brewItem/brewItem.jsx');
//const StringArrayEditor = require('../stringArrayEditor/stringArrayEditor.jsx');

const request = require('../../utils/request-middleware.js');

const ArchivePage = createClass({
    displayName: 'ArchivePage',
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {
            //request
            title: this.props.query.title || '',
            //tags		     : {},
            legacy: `${this.props.query.legacy === 'false' ? false : true}`,
            v3: `${this.props.query.v3 === 'false' ? false : true}`,
            pageSize: this.props.query.size || 10,
            page: parseInt(this.props.query.page) || 1,

            //response
            brewCollection: null,
            totalPages: null,
            totalBrews: null,

            searching: false,
            error: null,
        };
    },
    componentDidMount: function () {
        if (this.state.title !== '') {
            this.loadPage(this.state.page, false);
        }
    },

    updateStateWithBrews: function (brews, page, totalPages, totalBrews) {
        this.setState({
            brewCollection: brews || null,
            page: parseInt(page) || 1,
            totalPages: totalPages || 1,
            totalBrews: totalBrews,
            searching: false,
        });
    },

    updateUrl: function (title, page, size, v3, legacy) {
        const url = new URL(window.location.href);
        const urlParams = new URLSearchParams(url.search);

        //clean all params
        urlParams.delete('title');
        urlParams.delete('page');
        urlParams.delete('size');
        urlParams.delete('v3');
        urlParams.delete('legacy');

        urlParams.set('title', title);
        urlParams.set('page', page);
        urlParams.set('size', size);
        urlParams.set('v3', v3);
        urlParams.set('legacy', legacy);

        url.search = urlParams.toString(); // Convert URLSearchParams to string
        window.history.replaceState(null, null, url);
    },

    loadPage: async function (page, update) {
        //load form data directly
        const title = document.getElementById('title').value || '';
        const size = document.getElementById('size').value || 10;
        const v3 = document.getElementById('v3').checked;
        const legacy = document.getElementById('legacy').checked;

        // Update state with form data for later, only when first page
        if (update === true) {
            this.setState({
                title: title,
                pageSize: size,
                v3: v3,
                legacy: legacy,
            });
            this.updateUrl(title, page, size, v3, legacy);
        }

        if (title !== '') {
            try {
                this.setState({ searching: true, error: null });

                await request
                    .get(
                        `/api/archive?title=${title}&page=${page}&size=${size}&v3=${v3}&legacy=${legacy}`
                    )
                    .then((response) => {
                        if (response.ok) {
                            const totalPages = Math.ceil(response.body.totalBrews / response.body.pageSize);

                            this.updateStateWithBrews(
                                response.body.brews,
                                page,
                                totalPages,
                                response.body.totalBrews
                            );
                        }
                    });
            } catch (error) {
                console.log(response);
                this.setState({ error: `${error.response.status}` });
                this.updateStateWithBrews([], 1, 1, 0);
            }
            console.log('a', 
                !this.state.brewCollection || brewCollection.length === 0
            );
            if (!this.state.brewCollection) {
                this.setState({ error: '404' });
            }
        }

        
    },

    renderNavItems: function () {
        return (
            <Navbar>
                <Nav.section>
                    <Nav.item className="brewTitle">
                        Archive: Search for brews
                    </Nav.item>
                </Nav.section>
                <Nav.section>
                    <NewBrew />
                    <HelpNavItem />
                    <RecentNavItem />
                    <Account />
                </Nav.section>
            </Navbar>
        );
    },

    renderForm: function () {
        return (
            <div className="brewLookup">
                <h2 className="formTitle">Brew Lookup</h2>
                <div className="formContents">
                    <label>
                        Title of the brew
                        <input
                            id="title"
                            type="text"
                            name="title"
                            defaultValue={this.state.title}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    this.loadPage(1, true);
                                }
                            }}
                            placeholder="v3 Reference Document"
                        />
                    </label>

                    <label>
                        Results per page
                        <input
                            id="size"
                            type="number"
                            min="6"
                            step="2"
                            max="30"
                            name="pageSize"
                        />
                    </label>

                    <label>
                        <input
                            id="v3"
                            type="checkbox"
                            defaultChecked={this.state.v3}
                        />
                        Search for v3 brews
                    </label>

                    <label>
                        <input
                            id="legacy"
                            type="checkbox"
                            defaultChecked={this.state.legacy}
                        />
                        Search for legacy brews
                    </label>

                    {/* In the future, we should be able to filter the results by adding tags.
            		<<StringArrayEditor label='tags' valuePatterns={[/^(?:(?:group|meta|system|type):)?[A-Za-z0-9][A-Za-z0-9 \/.\-]{0,40}$/]}
					placeholder='add tag' unique={true}
					values={this.state.tags}
					onChange={(e)=>this.handleChange('tags', e)}/>

					check metadataEditor.jsx L65
            		*/}

                    <button
                        className="search"
                        onClick={() => {
                            this.loadPage(1, true);
                        }}
                    >
                        Search
                        <i
                            className={cx('fas', {
                                'fa-search': !this.state.searching,
                                'fa-spin fa-spinner': this.state.searching,
                            })}
                        />
                    </button>
                </div>
            </div>
        );
    },

    renderPaginationControls() {
        const title = encodeURIComponent(this.state.title);
        const size = parseInt(this.state.pageSize);
        const { page, totalPages, legacy, v3 } = this.state;
        const pages = new Array(totalPages).fill().map((_, index) => (
            <a
                key={index}
                className={`pageNumber ${
                    page == index + 1 ? 'currentPage' : ''
                }`}
                href={`/archive?title=${title}&page=${
                    index + 1
                }&size=${size}&v3=${v3}&legacy=${legacy}`}
            >
                {index + 1}
            </a>
        ));

        if (totalPages === null) {
            return;
        }

        return (
            <div className="paginationControls">
                {page > 1 && (
                    <button
                        className="previousPage"
                        onClick={() => this.loadPage(page - 1, false)}
                    >
                        &lt;&lt;
                    </button>
                )}
                <ol className="pages">{pages}</ol>
                {page < totalPages && (
                    <button
                        className="nextPage"
                        onClick={() => this.loadPage(page + 1, false)}
                    >
                        &gt;&gt;
                    </button>
                )}
            </div>
        );
    },

    renderFoundBrews() {
        console.log('State when rendering:');
        console.table(this.state);
        const { title, brewCollection, page, totalPages, error, searching } =
            this.state;

        if (searching) {
            return (
                <div className="foundBrews searching">
                    <h3 className="searchAnim">Searching</h3>
                </div>
            );
        }

        if (title === '') {
            return (
                <div className="foundBrews noBrews">
                    <h3>Whenever you want, just start typing...</h3>
                </div>
            );
        }

        if (error) {
            console.log('render Error: ', error);
            let errorMessage;
            switch (error.errorCode) {
                case '404':
                    errorMessage = "404 - We didn't find any brew";
                    break;
                case '503':
                    errorMessage =
                        ' 503 - Your search is not specific enough. Too many brews meet this criteria for us to display them.';
                    break;
                case '500':
                    errorMessage = "500 - We don't know what happened.";
                default:
                    errorMessage = 'An unexpected error occurred';
            }

            return (
                <div className="foundBrews noBrews">
                    <h3>Error: {errorMessage}</h3>
                </div>
            );
        }

        if (!brewCollection || brewCollection.length === 0) {
            return (
                <div className="foundBrews noBrews">
                    <h3>No brews found</h3>
                </div>
            );
        }

        return (
            <div className="foundBrews">
                <span className="totalBrews">
                    Brews found: {this.state.totalBrews}
                </span>
                {brewCollection.map((brew, index) => (
                    <BrewItem
                        brew={brew}
                        key={index}
                        reportError={this.props.reportError}
                    />
                ))}
                {this.renderPaginationControls()}
            </div>
        );
    },

    render: function () {
        return (
            <div className="archivePage">
                <link href="/themes/V3/Blank/style.css" rel="stylesheet" />
                <link href="/themes/V3/5ePHB/style.css" rel="stylesheet" />
                {this.renderNavItems()}

                <div className="content">
                    <div className="welcome">
                        <h1>Welcome to the Archive</h1>
                    </div>
                    <div className="flexGroup">
                        <div className="form dataGroup">
                            {this.renderForm()}
                        </div>
                        <div className="resultsContainer dataGroup">
                            <div className="title">
                                <h2>Your results, my lordship</h2>
                            </div>
                            {this.renderFoundBrews()}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
});

module.exports = ArchivePage;
