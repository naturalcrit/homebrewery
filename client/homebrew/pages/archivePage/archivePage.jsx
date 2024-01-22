require('./archivePage.less');
const React = require('react');
const createClass = require('create-react-class');
const _         = require('lodash');
const cx        = require('classnames');
const moment = require('moment');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');

const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

const ArchivePage = createClass({
    displayName : 'ArchivePage',
    getDefaultProps : function() {
        return {
            query     : '',
			foundBrew : null,
			searching : false,
			error     : null
        };
    },
    getInitialState : function() {
        return {
            uiItems : this.props.uiItems
        };
    },
    handleChange(e){
		this.setState({ query: e.target.value });
	},
	lookup(){
		this.setState({ searching: true, error: null });

		request.get(`/admin/lookup/${this.state.query}`)
			.then((res)=>this.setState({ foundBrew: res.body }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>this.setState({ searching: false }));
	},
    renderFoundBrew(){
		const brew = this.state.foundBrew;
		return <div className='foundBrew'>
			<dl>
				<dt>Title</dt>
				<dd>{brew.title}</dd>

				<dt>Authors</dt>
				<dd>{brew.authors.join(', ')}</dd>

				<dt>Edit Link</dt>
				<dd><a href={`/edit/${brew.editId}`} target='_blank' rel='noopener noreferrer'>/edit/{brew.editId}</a></dd>

				<dt>Share Link</dt>
				<dd><a href={`/share/${brew.shareId}`} target='_blank' rel='noopener noreferrer'>/share/{brew.shareId}</a></dd>

				<dt>Last Updated</dt>
				<dd>{Moment(brew.updatedAt).fromNow()}</dd>

				<dt>Num of Views</dt>
				<dd>{brew.views}</dd>
			</dl>
		</div>;
	},

    renderForm: function() {
        return <div className='brewLookup'>
            <h2>Brew Lookup</h2>
            <label>Title of the brew</label><input type='text' value={this.state.query} onChange={this.handleChange} placeholder='v3 Reference Document'/>
            {/* In the future, we should be able to filter the results by adding tags.
            <label>Tags</label><input type="text" value={this.state.query} placeholder='add a tag to filter'/>
            */}
            <button onClick={this.lookup}>
                <i className={cx('fas', {
                    'fa-search'          : !this.state.searching,
                    'fa-spin fa-spinner' : this.state.searching,
                })} />
            </button>

            {this.state.error
                && <div className='error'>{this.state.error.toString()}</div>
            }

            {this.state.foundBrew
                ? this.renderFoundBrew()
                : <div className='noBrew'>No brew found.</div>
            }
        </div>;
    },

    renderResults : function() {

    },
    
    renderNavItems : function() {
		return <Navbar>
			<Nav.section>
				<NewBrew />
				<HelpNavItem />
				<RecentNavItem />
				<Account />
			</Nav.section>
		</Navbar>;
	},

    render : function() {
		return 	<div className='archivePage'>
            {this.renderNavItems()}

            <div className='content'>
                <div className='welcome'>
                    <h1>Welcome to the Archive</h1>
                </div>
                <div className='flexGroup'>
                    <div className='form dataGroup'>
                        {this.renderForm()}
                    </div>
                    <div className='resultsContainer dataGroup'>
                        <div className='title'>
                            <h2>Your results, my lordship</h2>
                            {this.renderResults()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
	}
});

module.exports = ArchivePage;