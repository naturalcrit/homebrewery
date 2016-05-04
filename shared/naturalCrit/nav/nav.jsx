var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Nav = {

	base : React.createClass({
		render : function(){
			return <nav>
				<a href="/">

				</a>


				{this.props.children}
			</nav>
		}
	}),

	left : React.createClass({
		render : function(){
			return <div className='COM'>
				COM Ready!
			</div>
		}
	}),

	right : React.createClass({
		render : function(){
			return <div className='COM'>
				COM Ready!
			</div>
		}
	}),


	logo : function(props){
		return <span></span>

	},







};


module.exports = Nav;