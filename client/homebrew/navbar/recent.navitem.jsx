const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const Moment = require('moment');

import { LinkItem } from './menubarExtensions.jsx';

const EDIT_KEY = 'homebrewery-recently-edited';
const VIEW_KEY = 'homebrewery-recently-viewed';


const RecentItems = createClass({
	DisplayName     : 'RecentItems',
	getDefaultProps : function() {
		return {
			storageKey : '',
		};
	},

	getInitialState : function() {
		return {
			edit : [],
			view : []
		};
	},

	componentDidMount : function() {

		//== Load recent items list ==//
		let edited = JSON.parse(localStorage.getItem(EDIT_KEY) || '[]');
		let viewed = JSON.parse(localStorage.getItem(VIEW_KEY) || '[]');

		//== Add current brew to appropriate recent items list (depending on storageKey) ==//
		if(this.props.storageKey == 'edit'){
			let editId = this.props.brew.editId;
			if(this.props.brew.googleId){
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
			if(this.props.brew.googleId){
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
				if(prevProps.brew.googleId){
					prevEditId = `${prevProps.brew.googleId}${prevProps.brew.editId}`;
				}

				edited = _.filter(this.state.edit, (brew)=>{
					return brew.id !== prevEditId;
				});
				let editId = this.props.brew.editId;
				if(this.props.brew.googleId){
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


	removeItem : function(url, evt){
		evt.preventDefault();

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

	renderItems : function(brews){
		return _.map(brews, (brew, i)=>{
			return <LinkItem href={brew.url} className='item' key={`${brew.id}-${i}`} target='_blank' rel='noopener noreferrer' title={brew.title || '[ no title ]'}>
				<div className='title'>{brew.title || '[ no title ]'}</div>
				<div className='time'>{Moment(brew.ts).fromNow()}</div>
				<div className='clear' title='Remove from Recents' onClick={(e)=>{this.removeItem(`${brew.url}`, e);}}><i className='fas fa-times'></i></div>
			</LinkItem>;
		});
	},

	render : function(){
		return <div className={`recently-${this.props.storageKey}ed`}>
			<h4>{`${this.props.storageKey}ed`}</h4>
			{this.renderItems(this.state[this.props.storageKey])}
		</div>;
	}
});

module.exports = { RecentItems };