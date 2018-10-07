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

	icon : createClass({
		getDefaultProps : function() {
			return {
				icon : null
			};
		},
		render : function() {
			if(!this.props.icon)
				return null;
			const classes = cx('fa', this.props.icon, this.props.className);
			return <i className={classes} />;
		}
	}),

	block : createClass({
		getDefaultProps : function() {
			return {
				icon    : null,
				onClick : function(){},
				color   : null
			};
		},
		handleClick : function() {
			this.props.onClick();
		},
		render : function(){
			const classes = cx('navItem', this.props.color, this.props.className);

			const props = _.omit(this.props, ['newTab']);

			return <div {...props} className={classes} onClick={this.handleClick} >
				{this.props.children}
				<Nav.icon icon={this.props.icon} />
			</div>;
		}

	}),

	link : createClass({
		getDefaultProps : function() {
			return {
				icon   : null,
				href   : null,
				newTab : false,
				color  : null
			};
		},
		render : function(){
			const classes = cx('navItem', this.props.color, this.props.className);
			const props = _.omit(this.props, ['newTab']);

			return <a {...props} className={classes} target={this.props.newTab ? '_blank' : '_self'} >
				{this.props.children}
				<Nav.icon icon={this.props.icon} />
			</a>;
		}
	}),

	dropdown : createClass({
		getDefaultProps : function() {
			return {
				color : '',
				items : []
			};
		},
		getInitialState : function() {
			return {
				showDropdown : false
			};
		},
		handleDropdown : function(show){
			this.setState({
				showDropdown : show
			});
		},
		renderDropdown : function(){
			if(!this.state.showDropdown) return null;

			const items = this.props.items.map((item)=>{
				return <a href={item.href} className='item'>
					<span className='title'>{item.text}</span>
				</a>;
			});

			return <div className='dropdown'>{items}</div>;
		},

		render : function(){
			return <Nav.block className='with-dropdown' color={this.props.color}
				onMouseEnter={()=>this.handleDropdown(true)}
				onMouseLeave={()=>this.handleDropdown(false)}>
				{this.props.children}
				{this.renderDropdown()}
			</Nav.block>;
		}
	})
};

module.exports = Nav;