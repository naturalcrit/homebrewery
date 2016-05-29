var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Router = require('pico-router');

var NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');
var HomebrewIcon = require('naturalcrit/svg/homebrew.svg.jsx');

var Main = React.createClass({
	getDefaultProps: function() {
		return {
			tools : [
				{
					id : 'homebrew',
					path : '/homebrew',
					name : 'The Homebrewery',
					icon : <HomebrewIcon />,
					desc : 'Make authentic-looking 5e homebrews using Markdown',

					show : true,
					beta : false
				},
				{
					id : 'homebrew2',
					path : '/homebrew',
					name : 'The Homebrewery',
					icon : <HomebrewIcon />,
					desc : 'Make authentic-looking 5e homebrews using Markdown',

					show : false,
					beta : true
				},
				{
					id : 'homebrewfg2',
					path : '/homebrew',
					name : 'The Homebrewery',
					icon : <HomebrewIcon />,
					desc : 'Make authentic-looking 5e homebrews using Markdown',

					show : false,
					beta : false
				}

			]
		};
	},

	renderTool : function(tool){
		if(!tool.show) return null;

		return <a href={tool.path} className={cx('tool', tool.id, {beta : tool.beta})} key={tool.id}>
			<div className='content'>
				{tool.icon}
				<h2>{tool.name}</h2>
				<p>{tool.desc}</p>
			</div>
		</a>;
	},

	renderTools : function(){
		return _.map(this.props.tools, (tool)=>{
			return this.renderTool(tool);
		});
	},

	render : function(){
		return <div className='main'>
			<div className='top'>
				<div className='logo'>
					<NaturalCritIcon />
					<span className='name'>
						Natural
						<span className='crit'>Crit</span>
					</span>
				</div>
				<p>Top-tier tools for the discerning DM</p>
			</div>
			<div className='tools'>
				{this.renderTools()}
			</div>
		</div>
	}
});

module.exports = Main;
