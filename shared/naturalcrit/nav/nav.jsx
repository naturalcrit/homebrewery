var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

var Nav = {
	base : React.createClass({
		render : function(){
			return <nav>
				<div className='navContent'>
					{this.props.children}
				</div>
			</nav>
		}
	}),
	logo : function(){
		return <a className='navLogo' href="http://naturalcrit.com">
			<NaturalCritIcon />
			<span className='name'>
				Natural<span className='crit'>Crit</span>
			</span>
		</a>;
	},

	section : React.createClass({
		render : function(){
			return <div className='navSection'>
				{this.props.children}
			</div>
		}
	}),

	item : React.createClass({
		getDefaultProps: function() {
			return {
				icon : null,
				href : null,
				newTab : false,
				onClick : function(){},
				color : null
			};
		},
		handleClick : function(){
			this.props.onClick();
		},
		render : function(){
			var classes = cx('navItem', this.props.color, this.props.className);

			var icon;
			if(this.props.icon) icon = <i className={'fa ' + this.props.icon} />;

			if(this.props.href){
				return <a {...this.props} className={classes} target={this.props.newTab ? '_blank' : '_self'} >
					{this.props.children}
					{icon}
				</a>
			}else{
				return <div {...this.props} className={classes} onClick={this.handleClick} >
					{this.props.children}
					{icon}
				</div>
			}
		}
	}),

};


module.exports = Nav;