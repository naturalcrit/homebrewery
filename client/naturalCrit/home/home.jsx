var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Router = require('pico-router');
var Icon = require('naturalCrit/icon.svg.jsx');
var Logo = require('naturalCrit/logo/logo.jsx');


var HomebrewIcon = require('naturalCrit/homebrewIcon.svg.jsx');
var CombatIcon = require('naturalCrit/combatIcon.svg.jsx');

var Home = React.createClass({

	navigate : function(){

	},

	render : function(){
		var self = this;
		return(
			<div className='home'>


				<div className='top'>
					<Logo />
					<p>Top-tier tools for the discerning DM</p>
				</div>

				<div className='tools'>

					<div className='homebrew toolContainer' onClick={Router.navigate.bind(self, '/homebrew')}>
						<div className='content'>
							<HomebrewIcon />
							<h2>The Homebrewery</h2>
							<p>Make authentic-looking 5e homebrews using Markdown</p>
						</div>
					</div>
					<div className='combat toolContainer underConstruction' onClick={Router.navigate.bind(self, '/combat')}>
						<div className='content'>
							<CombatIcon />
							<h2>Combat Manager</h2>
							<p>Easily create and manage complex encouters for your party</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = Home;
