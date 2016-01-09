var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Icon = require('naturalCrit/icon.svg.jsx');

var Logo = require('naturalCrit/logo/logo.jsx');


var HomebrewIcon = require('naturalCrit/homebrewIcon.svg.jsx');
var CombatIcon = require('naturalCrit/combatIcon.svg.jsx');

var Home = React.createClass({

	render : function(){
		var self = this;
		return(
			<div className='home'>


				<div className='top'>
					<Logo />
					<p>Tip-top tools for the discerning DM</p>
				</div>

				<div className='tools'>

					<div className='homebrew toolContainer' href='/homebrew'>
						<HomebrewIcon />
						<h2>The Homebrewery</h2>
						<p>Make authentic-looking 5e homebrews using just <a href='https://help.github.com/articles/markdown-basics/'>Markdown</a></p>

					</div>
					<div className='combat toolContainer underConstruction'>
						<CombatIcon />
						<h2>Combat Manager</h2>
						<p>Easily create and manage complex encouters for your party</p>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = Home;
