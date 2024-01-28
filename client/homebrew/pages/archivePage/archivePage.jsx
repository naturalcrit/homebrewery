require('./archivePage.less');

const React       = require('react');
const createClass = require('create-react-class');
const _           = require('lodash');
const cx          = require('classnames');

const Nav           = require('naturalcrit/nav/nav.jsx');
const Navbar        = require('../../navbar/navbar.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account       = require('../../navbar/account.navitem.jsx');
const NewBrew       = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem   = require('../../navbar/help.navitem.jsx');
const BrewItem      = require('../basePages/listPage/brewItem/brewItem.jsx');

const request = require('superagent');

const ArchivePage = createClass({
  displayName: 'ArchivePage',
  getDefaultProps: function () {
    return {};
  },
  getInitialState: function () {
    return {
      title      : this.props.query.title || '',
      brewCollection : null,
      searching  : false,
      error      : null,
      limit      : '',
    };
  },
  componentDidMount : function() {
    this.lookup();
  },
  

  handleChange(e) {
    this.setState({ title: e.target.value });
  },
  lookup() {
    this.setState({ searching: true, error: null });
    request
      .get(`/archive/${this.state.title}`)
      .then((res) => this.setState({ brewCollection: res.body.brews }, this.setState({ limit: res.body.message}, this.setState({ error: null}))))
      .catch((err) => this.setState({ error: err }))
      .finally(() => this.setState({ searching: false }));
  },
  updateUrl: function() {
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.search);
    // Clear existing parameters
    urlParams.delete('sort');
    urlParams.delete('dir');
    urlParams.delete('filter');

    // Set the pathname to '/archive/?query'
    urlParams.set('title', this.state.title);

    url.search = urlParams;
    window.history.replaceState(null, null, url);
},
  renderFoundBrews() {
    const brews = this.state.brewCollection;
    console.log('brews: ',brews);
    if (this.state.error !== null) {
      return(
        <div className="foundBrews noBrews">
          <div>
            <h3>I'm sorry, your request didn't work</h3>
            <br />
            <p>Your search is not enough specific, too many brews meet this criteria for us to forward them.</p>
        </div>
        
      </div>
      );
    }

    if (!brews || brews.length === 0) {
      return(
      <div className="foundBrews noBrews">
        <h3>We haven't found brews meeting your request.</h3>
      </div>
       
      );
    }
    this.updateUrl();
      return <div className="foundBrews">
        <div className="brewCount">{brews.length} Brews Found</div>
        <div className="limit">
          <p>{this.state.limit}</p>
        </div>
        {brews.map((brew, index) => (
        <BrewItem brew={brew} key={index} reportError={this.props.reportError}/>
        ))}
      </div>
       
    
  },

  renderForm: function () {
    return (
      <div className='brewLookup'>
        <h2>Brew Lookup</h2>
        <label>Title of the brew</label>
        <input
          type='text'
          value={this.state.title}
          onChange={this.handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              this.handleChange(e);
              this.lookup();
            }
          }}
          placeholder='v3 Reference Document'
        />
        {/* In the future, we should be able to filter the results by adding tags.
            <label>Tags</label><input type='text' value={this.state.query} placeholder='add a tag to filter'/>
            <input type="checkbox" id="v3" /><label>v3 only</label>
            */}
            
            <button onClick={() => { this.handleChange({ target: { value: this.state.title } }); this.lookup(); }}>
          <i
            className={cx('fas', {
              'fa-search': !this.state.searching,
              'fa-spin fa-spinner': this.state.searching,
            })}
          />
        </button>
      </div>
    );
  },

  

  renderNavItems: function () {
    return (
      <Navbar>
        <Nav.section>
					<Nav.item className='brewTitle'>Archive: Search for brews</Nav.item>
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

  render: function () {
    return (
      <div className='archivePage'>
        <link href='/themes/V3/Blank/style.css' rel='stylesheet'/>
			  <link href='/themes/V3/5ePHB/style.css' rel='stylesheet'/>
        {this.renderNavItems()}

        <div className='content'>
          <div className='welcome'>
            <h1>Welcome to the Archive</h1>
          </div>
          <div className='flexGroup'>
            <div className='form dataGroup'>{this.renderForm()}</div>
            <div className='resultsContainer dataGroup'>
              <div className='title'>
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
