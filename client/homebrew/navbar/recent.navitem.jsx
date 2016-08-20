var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Moment = require('moment');

var Nav = require('naturalcrit/nav/nav.jsx');

const VIEW_KEY = 'homebrewery-recently-viewed';
const EDIT_KEY = 'homebrewery-recently-edited';

var BaseItem = React.createClass({
	getDefaultProps: function() {
		return {
			storageKey : '',
			text : '',
			currentBrew:{
				title : '',
				id : '',
				url : ''
			}
		};
	},
	getInitialState: function() {
		return {
			showDropdown: false,
			brews : []
		};
	},

	componentDidMount: function() {
		var brews = JSON.parse(localStorage.getItem(this.props.storageKey) || '[]');

		brews = _.filter(brews, (brew)=>{
			return brew.id !== this.props.currentBrew.id;
		});
		if(this.props.currentBrew.id){
			brews.unshift({
				id : this.props.currentBrew.id,
				url : this.props.currentBrew.url,
				title : this.props.currentBrew.title,
				ts : Date.now()
			});
		}
		brews = _.slice(brews, 0, 8);
		localStorage.setItem(this.props.storageKey, JSON.stringify(brews));
		this.setState({
			brews : brews
		});
	},

	handleDropdown : function(show){
		this.setState({
			showDropdown : show
		})
	},

	renderDropdown : function(){
		if(!this.state.showDropdown) return null;

		var items = _.map(this.state.brews, (brew)=>{
			return <a href={brew.url} className='item' key={brew.id} target='_blank'>
				<span className='title'>{brew.title}</span>
				<span className='time'>{Moment(brew.ts).fromNow()}</span>
			</a>
		});

		return <div className='dropdown'>{items}</div>
	},

	render : function(){
		return <Nav.item icon='fa-clock-o' color='grey' className='recent'
					onMouseEnter={this.handleDropdown.bind(null, true)}
					onMouseLeave={this.handleDropdown.bind(null, false)}>
			{this.props.text}
			{this.renderDropdown()}
		</Nav.item>
	},

});



module.exports = {
	viewed : React.createClass({
		getDefaultProps: function() {
			return {
				brew : {
					title : '',
					shareId : ''
				}
			};
		},
		render : function(){
			return <BaseItem text='recently viewed' storageKey={VIEW_KEY}
				currentBrew={{
					id : this.props.brew.shareId,
					title : this.props.brew.title,
					url : `/share/${this.props.brew.shareId}`
				}}
			/>
		},
	}),

	edited : React.createClass({
		getDefaultProps: function() {
			return {
				brew : {
					title : '',
					editId : ''
				}
			};
		},
		render : function(){
			return <BaseItem text='recently edited' storageKey={EDIT_KEY}
				currentBrew={{
					id : this.props.brew.editId,
					title : this.props.brew.title,
					url : `/edit/${this.props.brew.editId}`
				}}
			/>
		},
	}),

	both : React.createClass({
		getDefaultProps: function() {
			return {
				errorId : null
			};
		},

		getInitialState: function() {
			return {
				showDropdown: false,
				edit : [],
				view : []
			};
		},

		componentDidMount: function() {

			var edited = JSON.parse(localStorage.getItem(EDIT_KEY) || '[]');
			var viewed = JSON.parse(localStorage.getItem(VIEW_KEY) || '[]');

			if(this.props.errorId){
				edited = _.filter(edited, (edit) => {
					return edit.id !== this.props.errorId;
				});
				viewed = _.filter(viewed, (view) => {
					return view.id !== this.props.errorId;
				});

				localStorage.setItem(EDIT_KEY, JSON.stringify(edited));
				localStorage.setItem(VIEW_KEY, JSON.stringify(viewed));
			}


			this.setState({
				edit : edited,
				view : viewed
			});
		},

		handleDropdown : function(show){
			this.setState({
				showDropdown : show
			})
		},

		renderDropdown : function(){
			if(!this.state.showDropdown) return null;

			var makeItems = (brews) => {
				return _.map(brews, (brew)=>{
					return <a href={brew.url} className='item' key={brew.id} target='_blank'>
						<span className='title'>{brew.title}</span>
						<span className='time'>{Moment(brew.ts).fromNow()}</span>
					</a>
				});
			};

			return <div className='dropdown'>
				<h4>edited</h4>
				{makeItems(this.state.edit)}
				<h4>viewed</h4>
				{makeItems(this.state.view)}
			</div>
		},

		render : function(){
			return <Nav.item icon='fa-clock-o' color='grey' className='recent'
						onMouseEnter={this.handleDropdown.bind(null, true)}
						onMouseLeave={this.handleDropdown.bind(null, false)}>
				Recent brews
				{this.renderDropdown()}
			</Nav.item>
		}

	})
}