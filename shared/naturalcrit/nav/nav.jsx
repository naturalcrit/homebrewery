const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

const Nav = {
	base : createClass({
		render : function(){
			return <nav>
				<div className='navContent'>
					{this.props.children}
				</div>
			</nav>;
		}
	}),
	logo : function(){
		return <a className='navLogo' href='http://naturalcrit.com'>
			<NaturalCritIcon />
			<span className='name'>
				Natural<span className='crit'>Crit</span>
			</span>
		</a>;
	},

	section : createClass({
		render : function(){
			return <div className='navSection'>
				{this.props.children}
			</div>;
		}
	}),

	item : createClass({
		getDefaultProps : function() {
			return {
				icon    : null,
				href    : null,
				newTab  : false,
				onClick : function(){},
				color   : null
			};
		},
		handleClick : function(){
			this.props.onClick();
		},
		render : function(){
			const classes = cx('navItem', this.props.color, this.props.className);

			let icon;
			if(this.props.icon) icon = <i className={`fa ${this.props.icon}`} />;

			const props = _.omit(this.props, ['newTab']);

			if(this.props.href){
				return <a {...props} className={classes} target={this.props.newTab ? '_blank' : '_self'} >
					{this.props.children}
					{icon}
				</a>;
			} else {
				return <div {...props} className={classes} onClick={this.handleClick} >
					{this.props.children}
					{icon}
				</div>;
			}
		}
	}),

};


module.exports = Nav;