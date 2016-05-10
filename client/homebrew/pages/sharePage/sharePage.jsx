var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('../../navbar/navbar.jsx');

var PrintLink = require('../../navbar/print.navitem.jsx');

var BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

var replaceAll = function(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}

var SharePage = React.createClass({
	getDefaultProps: function() {
		return {
			brew : {
				title : '',
				text : '',
				shareId : null,
				createdAt : null,
				updatedAt : null,
				views : 0
			}
		};
	},

	openSourceWindow : function(){
		var sourceWindow = window.open();
		var content = replaceAll(this.props.brew.text, '<', '&lt;');
		content = replaceAll(content, '>', '&gt;');
		sourceWindow.document.write('<code><pre>' + content + '</pre></code>');
	},


	render : function(){
		return <div className='sharePage page'>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<PrintLink shareId={this.props.brew.shareId} />
					<Nav.item onClick={this.openSourceWindow} color='teal' icon='fa-code'>
						source
					</Nav.item>
				</Nav.section>
			</Navbar>

			<div className='content'>
				<BrewRenderer text={this.props.brew.text} />
			</div>
		</div>
	}
});

module.exports = SharePage;
