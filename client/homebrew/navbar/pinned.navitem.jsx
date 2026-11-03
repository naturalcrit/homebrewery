import React from 'react';
import createReactClass from 'create-react-class';
import Moment from 'moment';
import request from 'superagent';

import Nav from './nav.jsx';


const FavoritesNav = createReactClass({
	displayName     : 'FavoritesNav',
	getDefaultProps : function() {
		return {
		};
	},

	getInitialState : function() {
		return {
			isPinnedBrew : global?.account ? this.props.brew.isPinned : false
		};
	},

	componentDidMount : function() {
	},

	togglePinState : async function(){
		if(global.account) {
			const newPinnedBrewState = !this.state.isPinnedBrew;
			this.setState((prevProps)=>({
				isPinnedBrew : newPinnedBrewState
			}));
			await request.put('/pin')
				.send({ username: global.account.username,  shareId: this.props.brew.shareId, pinState: newPinnedBrewState });
		}
	},

	render : function(){
		return <Nav.item icon='fas fa-thumbtack' color='grey' className={`brewPin ${this.state.isPinnedBrew ? 'active' : 'inactive'}`}
			onClick={()=>this.togglePinState()}>
		</Nav.item>;
	}

});

export default FavoritesNav;
