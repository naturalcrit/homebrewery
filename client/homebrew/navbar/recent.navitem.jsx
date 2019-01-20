const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const Moment = require('moment');

const Nav = require('naturalcrit/nav/nav.jsx');

const EDIT_KEY = 'homebrewery-recently-edited';
const VIEW_KEY = 'homebrewery-recently-viewed';


const RecentItems = createClass({

	getDefaultProps : function() {
		return {
			storageKey : '',
			showEdit   : false,
			showView   : false
		};
	},

	getInitialState : function() {
		return {
			showDropdown : false,
			edit         : [],
			view         : []
		};
	},

	componentDidMount : function() {

	//== Load recent items list ==//
		let edited = JSON.parse(localStorage.getItem(EDIT_KEY) || '[]');
		let viewed = JSON.parse(localStorage.getItem(VIEW_KEY) || '[]');

		//== Add current brew to appropriate recent items list (depending on storageKey) ==//
		if(this.props.storageKey == 'edit'){
			edited = _.filter(edited, (brew)=>{
				return brew.id !== this.props.brew.editId;
			});
			edited.unshift({
				id    : this.props.brew.editId,
				title : this.props.brew.title,
				url   : `/edit/${this.props.brew.editId}`,
				ts    : Date.now()
			});
		}
		if(this.props.storageKey == 'view'){
			viewed = _.filter(viewed, (brew)=>{
				return brew.id !== this.props.brew.shareId;
			});
			viewed.unshift({
				id    : this.props.brew.shareId,
				title : this.props.brew.title,
				url   : `/share/${this.props.brew.shareId}`,
				ts    : Date.now()
			});
		}

		//== Store the updated lists (up to 8 items each) ==//
		edited = _.slice(edited, 0, 8);
		viewed = _.slice(viewed, 0, 8);

		localStorage.setItem(EDIT_KEY, JSON.stringify(edited));
		localStorage.setItem(VIEW_KEY, JSON.stringify(viewed));

		this.setState({
			edit : edited,
			view : viewed
		});
	},

	handleDropdown : function(show){
		this.setState({
			showDropdown : show
		});
	},

	renderDropdown : function(){
		if(!this.state.showDropdown) return null;

		const makeItems = (brews)=>{
			return _.map(brews, (brew)=>{
				return <a href={brew.url} className='item' key={brew.id} target='_blank' rel='noopener noreferrer'>
					<span className='title'>{brew.title || '[ no title ]'}</span>
					<span className='time'>{Moment(brew.ts).fromNow()}</span>
				</a>;
			});
		};

		return <div className='dropdown'>
			{(this.props.showEdit && this.props.showView) ?
				<h4>edited</h4> : null }
			{this.props.showEdit ?
				makeItems(this.state.edit) : null }
			{(this.props.showEdit && this.props.showView) ?
				<h4>viewed</h4>	: null }
			{this.props.showView ?
				makeItems(this.state.view) : null }
		</div>;
	},

	render : function(){
		return <Nav.item icon='fa-clock-o' color='grey' className='recent'
			onMouseEnter={()=>this.handleDropdown(true)}
			onMouseLeave={()=>this.handleDropdown(false)}>
			{this.props.text}
			{this.renderDropdown()}
		</Nav.item>;
	}

});

module.exports = {

	edited : (props)=>{
		return <RecentItems
			brew={props.brew}
			storageKey={props.storageKey}
			text='recently edited'
			showEdit={true}
		/>;
	},

	viewed : (props)=>{
		return <RecentItems
			brew={props.brew}
			storageKey={props.storageKey}
			text='recently viewed'
			showView={true}
		/>;
	},

	both : (props)=>{
		return <RecentItems
			brew={props.brew}
			storageKey={props.storageKey}
			text='recent brews'
			showEdit={true}
			showView={true}
		/>;
	}
};