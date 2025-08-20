require('./homePage.less');
const React = require('react');
const createClass = require('create-react-class');
const cx = require('classnames');
import request from '../../utils/request-middleware.js';
const { Meta } = require('vitreum/headtags');



const BaseEditPage = require('../basePages/editPage/editPage.jsx');

const { DEFAULT_BREW } = require('../../../../server/brewDefaults.js');

const HomePage = createClass({
	displayName     : 'HomePage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW
		};
	},

	save : function(brew){
		return request
			.post('/api')
			.send(brew)
			.then((res) => {
				const saved = res.body;
				window.location = `/edit/${saved.editId}`;
			});
	},

	render : function(){
		return <BaseEditPage
							{...this.props}
							className="homePage"
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
