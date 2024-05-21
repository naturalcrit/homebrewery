require('./archivePage.less');

const React = require('react');
const createClass = require('create-react-class');
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
            //# request
            title: this.props.query.title || '',
            //tags: {},
            legacy: this.props.query.legacy !== 'false',
            v3: this.props.query.v3 !== 'false',
            pageSize: this.props.query.size || 10,
            page: parseInt(this.props.query.page) || 1,

            //# response
            brewCollection: null,
            totalBrews: null,

            searching: false,
            error: null,
        };
    },

    componentDidMount: function () {
        if (this.state.title !== '') {
            this.loadPage(this.state.page, false);
        }
        this.state.totalBrews || this.loadTotal(); // Load total if not already loaded
    },

    updateStateWithBrews: function (brews, page) {
        this.setState({
            brewCollection: brews || null,
            page: parseInt(page) || 1,
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
        console.log('running loadPage');
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
                const response = await request.get(
                    `/api/archive?title=${title}&page=${page}&size=${size}&v3=${v3}&legacy=${legacy}`
                );
                if (response.ok) {
                    this.updateStateWithBrews(response.body.brews, page);
                }
            } catch (error) {
                console.log('error at loadPage: ', error);
                this.setState({ error: `${error.response.status}` });
                this.updateStateWithBrews([], 1);
            }
            if (!this.state.brewCollection) {
                this.setState({ error: '404' });
            }
        }
    },

    loadTotal: async function () {
        console.log('running loadTotal');
        const { title, v3, legacy } = this.state;
        this.setState({
            totalBrews: null,
        });

        if (title !== '') {
            try {
                await request
                    .get(
                        `/api/archive/total?title=${title}&v3=${v3}&legacy=${legacy}`
                    )
                    .then((response) => {
                        if (response.ok) {
                            this.setState({
                                totalBrews: response.body.totalBrews,
                            });
                        }
                    });
            } catch (error) {
                console.log('error at loadTotal: ', error);
                this.setState({ error: `${error.response.status}` });
                this.updateStateWithBrews([], 1);
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
                                    this.loadTotal();
                                    this.loadPage(1, true);
                                }
                            }}
                            placeholder="v3 Reference Document"
                        />
                    </label>
                    <small>
                        Tip! you can use <code>-</code> to negate words, and{' '}
                        <code>"word"</code> to specify an exact string.
                    </small>
                    <label>
                        Results per page
                        <input
                            id="size"
                            type="number"
                            min="6"
                            step="2"
                            max="30"
                            defaultValue={this.state.pageSize}
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
                            this.loadTotal();
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
                <small>
                    Remember, you can only search brews with this tool if they
                    are published
                </small>
            </div>
        );
    },

    renderPaginationControls: function () {
        if (!this.state.totalBrews) {
            return null;
        }

        const size = parseInt(this.state.pageSize);
        const { page, totalBrews } = this.state;
        const totalPages = Math.ceil(totalBrews / size);

        let startPage, endPage;
        if (page <= 6) {
            startPage = 1;
            endPage = Math.min(totalPages, 10);
        } else if (page + 4 >= totalPages) {
            startPage = Math.max(1, totalPages - 9);
            endPage = totalPages;
        } else {
            startPage = page - 5;
            endPage = page + 4;
        }

        const pagesAroundCurrent = new Array(endPage - startPage + 1)
            .fill()
            .map((_, index) => (
                <a
                    key={startPage + index}
                    className={`pageNumber ${
                        page === startPage + index ? 'currentPage' : ''
                    }`}
                    onClick={() => this.loadPage(startPage + index, false)}
                >
                    {startPage + index}
                </a>
            ));

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
                <ol className="pages">
                    {startPage > 1 && (
                        <a
                            className="firstPage pageNumber"
                            onClick={() => this.loadPage(1, false)}
                        >
                            1 ...
                        </a>
                    )}
                    {pagesAroundCurrent}
                    {endPage < totalPages && (
                        <a
                            className="lastPage pageNumber"
                            onClick={() => this.loadPage(totalPages, false)}
                        >
                            ... {totalPages}
                        </a>
                    )}
                </ol>
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
        const { title, brewCollection, error, searching } = this.state;

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
                        '503 - Service Unavailable, try again later, sorry.';
                    break;
                case '500':
                    errorMessage =
                        "500 - We don't know what happened, go ahead and contact the mods or report as a mistake.";
                    break;
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
                                <h2>Your searched returned these results</h2>
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
