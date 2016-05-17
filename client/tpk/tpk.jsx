var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('./navbar/navbar.jsx');


var TPK = React.createClass({

	render : function(){
		return <div className='tpk page'>
			<Navbar>
				<Nav.section>
					<Nav.item>
						yo dawg
					</Nav.item>
				</Nav.section>
			</Navbar>
			<div className='content'>

				Holla y'all

			</div>
		</div>
	}
});

module.exports = TPK;
