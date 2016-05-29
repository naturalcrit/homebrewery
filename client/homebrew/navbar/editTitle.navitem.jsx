var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Nav = require('naturalcrit/nav/nav.jsx');

const MAX_TITLE_LENGTH = 50;


var EditTitle = React.createClass({
	getDefaultProps: function() {
		return {
			title : '',
			onChange : function(){}
		};
	},

	handleChange : function(e){
		if(e.target.value.length > MAX_TITLE_LENGTH) return;
		this.props.onChange(e.target.value);
	},
	render : function(){
		return <Nav.item className='editTitle'>
			<input placeholder='Brew Title' type='text' value={this.props.title} onChange={this.handleChange} />

			<div className={cx('charCount', {'max' : this.props.title.length >= MAX_TITLE_LENGTH})}>
				{this.props.title.length}/{MAX_TITLE_LENGTH}
			</div>
		</Nav.item>
	},

});

module.exports = EditTitle;