const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const Moment = require('moment');

const Nav = require('client/homebrew/navbar/nav.jsx');

const EDIT_KEY = 'HB_nav_recentlyEdited';
const VIEW_KEY = 'HB_nav_recentlyViewed';


const RecentItems = createClass({
	DisplayName     : 'RecentItems',
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
			let editId = this.props.brew.editId;
			if(this.props.brew.googleId && !this.props.brew.stubbed){
				editId = `${this.props.brew.googleId}${this.props.brew.editId}`;
			}
			edited = _.filter(edited, (brew)=>{
				return brew.id !== editId;
			});
			edited.unshift({
				id    : editId,
				title : this.props.brew.title,
				url   : `/edit/${editId}`,
				ts    : Date.now()
			});
		}
		if(this.props.storageKey == 'view'){
			let shareId = this.props.brew.shareId;
			if(this.props.brew.googleId && !this.props.brew.stubbed){
				shareId = `${this.props.brew.googleId}${this.props.brew.shareId}`;
			}
			viewed = _.filter(viewed, (brew)=>{
				return brew.id !== shareId;
			});
			viewed.unshift({
				id    : shareId,
				title : this.props.brew.title,
				url   : `/share/${shareId}`,
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

	componentDidUpdate : function(prevProps) {
		if(prevProps.brew && this.props.brew.editId !== prevProps.brew.editId) {
	 		let edited = JSON.parse(localStorage.getItem(EDIT_KEY) || '[]');
			if(this.props.storageKey == 'edit') {
				let prevEditId = prevProps.brew.editId;
				if(prevProps.brew.googleId && !this.props.brew.stubbed){
					prevEditId = `${prevProps.brew.googleId}${prevProps.brew.editId}`;
				}

				edited = _.filter(this.state.edit, (brew)=>{
					return brew.id !== prevEditId;
				});
				let editId = this.props.brew.editId;
				if(this.props.brew.googleId && !this.props.brew.stubbed){
					editId = `${this.props.brew.googleId}${this.props.brew.editId}`;
				}
				edited.unshift({
					id    : editId,
					title : this.props.brew.title,
					url   : `/edit/${editId}`,
					ts    : Date.now()
				});
			}

			//== Store the updated lists (up to 8 items each) ==//
			edited = _.slice(edited, 0, 8);

			localStorage.setItem(EDIT_KEY, JSON.stringify(edited));

			this.setState({
				edit : edited
			});
		}
	},

	handleDropdown : function(show){
		this.setState({
			showDropdown : show
		});
	},

	removeItem : function(url, evt){
		evt.preventDefault();
		evt.stopPropagation();

		let edited = JSON.parse(localStorage.getItem(EDIT_KEY) || '[]');
		let viewed = JSON.parse(localStorage.getItem(VIEW_KEY) || '[]');

		edited = edited.filter((item)=>{ return (item.url !== url);});
		viewed = viewed.filter((item)=>{ return (item.url !== url);});

		localStorage.setItem(EDIT_KEY, JSON.stringify(edited));
		localStorage.setItem(VIEW_KEY, JSON.stringify(viewed));

		this.setState({
			edit : edited,
			view : viewed
		});

	},

	renderDropdown : function(){
		// if(!this.state.showDropdown) return null;

		const makeItems = (brews)=>{
			return _.map(brews, (brew, i)=>{
				return <a className='navItem' href={brew.url} key={`${brew.id}-${i}`} target='_blank' rel='noopener noreferrer' title={brew.title || '[ no title ]'}>
					<span className='title'>{brew.title || '[ no title ]'}</span>
					<span className='time'>{Moment(brew.ts).fromNow()}</span>
					<div className='clear' title='Remove from Recents' onClick={(e)=>{this.removeItem(`${brew.url}`, e);}}><i className='fas fa-times'></i></div>
				</a>;
			});
		};

		return <>
			{(this.props.showEdit && this.props.showView) ?
				<Nav.item className='header'>edited</Nav.item> : null }
			{this.props.showEdit ?
				makeItems(this.state.edit) : null }
			{(this.props.showEdit && this.props.showView) ?
				<Nav.item className='header'>viewed</Nav.item>	: null }
			{this.props.showView ?
				makeItems(this.state.view) : null }
		</>;
	},

	render : function(){
		return <Nav.dropdown className='recent'>
			<Nav.item icon='fas fa-history' color='grey' >
				{this.props.text}
			</Nav.item>
			{this.renderDropdown()}
		</Nav.dropdown>;
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
