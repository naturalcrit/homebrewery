var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Moment = require('moment');

var Nav = require('naturalcrit/nav/nav.jsx');

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
			return <BaseItem text='recently viewed' storageKey='homebrewery-recently-viewed'
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
			return <BaseItem text='recently edited' storageKey='homebrewery-recently-edited'
				currentBrew={{
					id : this.props.brew.editId,
					title : this.props.brew.title,
					url : `/edit/${this.props.brew.editId}`
				}}
			/>
		},
	}),
}