var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var AttackSlot = require('./attackSlot/attackSlot.jsx');

var MonsterCard = React.createClass({
	getDefaultProps: function() {
		return {
			name : '',
			hp : 1,
			currentHP : 1,
			ac: 1,
			move : 30,
			attr : {
				str : 8,
				con : 8,
				dex : 8,
				int : 8,
				wis : 8,
				cha : 8
			},
			attacks : {},
			spells : {},
			abilities : [],
			items : [],

			updateHP  : function(){},
			remove  : function(){},
		};
	},

	getInitialState: function() {
		return {
			//currentHP: this.props.hp,
			status : 'normal',
			usedThings : [],

			lastRoll : {

			},


			mousePos : null,
			tempHP : 0
		};
	},

	componentDidMount: function() {
		window.addEventListener('mousemove', this.handleMouseDrag);
		window.addEventListener('mouseup', this.handleMouseUp);
	},

	handleMouseDown : function(e){
		this.setState({
			mousePos : {
				x : e.pageX,
				y : e.pageY,
			}
		});
		e.stopPropagation()
		e.preventDefault()
	},
	handleMouseUp : function(e){
		if(!this.state.mousePos) return;


		this.props.updateHP(this.props.currentHP + this.state.tempHP);
		this.setState({
			mousePos : null,
			tempHP : 0
		});
	},

	handleMouseDrag : function(e){
		if (!this.state.mousePos) return;
		var distance = Math.sqrt(Math.pow(e.pageX - this.state.mousePos.x, 2) + Math.pow(e.pageY - this.state.mousePos.y, 2));
		var mult = (e.pageY > this.state.mousePos.y ? -1 : 1)

		this.setState({
			tempHP : Math.floor(distance * mult/25)
		})
	},


	renderHPBox : function(){

		var tempHP
		if(this.state.tempHP){
			var sign = (this.state.tempHP > 0 ? '+' : '');
			tempHP = <span className='tempHP'>{['(',sign,this.state.tempHP,')'].join('')}</span>
		}

		return <div className='hpBox' onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp}>
			<div className='currentHP'>
				{tempHP} {this.props.currentHP}
			</div>
			<div className='maxHP'>{this.props.hp}</div>
		</div>
	},

	renderStats : function(){

	},


	rollDice : function(key, notation){
		var additive = 0;
		var dice = _.reduce([/\+(.*)/, /\-(.*)/], function(r, regexp){
			var res = r.match(regexp);
			if(res){
				additive = res[0]*1;
				r = r.replace(res[0], '')
			}
			return r;
		}, notation)

		var numDice = dice.split('d')[0];
		var die = dice.split('d')[1];

		var diceRoll = _.times(numDice, function(){
			return _.random(1, die);
		});
		var res = _.sum(diceRoll) + additive;
		if(numDice == 1 && die == 20){
			if(diceRoll[0] == 1) res = 'Fail!';
			if(diceRoll[0] == 20) res = 'Crit!';
		}
		this.state.lastRoll[key] = res
		this.setState({
			lastRoll : this.state.lastRoll
		})
	},


	renderAttacks : function(){
		var self = this;
		return _.map(this.props.attacks, function(attack, name){
			return <AttackSlot key={name} name={name} {...attack} />
		})
	},

	renderSpells : function(){
		var self = this;
		return _.map(this.props.spells, function(spell, name){
			return <AttackSlot key={name} name={name} {...spell} />
		})
	},

	render : function(){
		var self = this;

		var condition = ''
		if(this.props.currentHP + this.state.tempHP > this.props.hp) condition='overhealed';
		if(this.props.currentHP + this.state.tempHP <= this.props.hp * 0.5) condition='hurt';
		if(this.props.currentHP + this.state.tempHP <= this.props.hp * 0.2) condition='last_legs';
		if(this.props.currentHP + this.state.tempHP <= 0) condition='dead';


		return(
			<div className={cx('monsterCard', condition)}>
				<div className='healthbar' style={{width : (this.props.currentHP + this.state.tempHP)/this.props.hp*100 + '%'}} />
				<div className='overhealbar' style={{width : (this.props.currentHP + this.state.tempHP - this.props.hp)/this.props.hp*100 + '%'}} />


				{this.renderHPBox()}
				<div className='name'>{this.props.name}</div>

				<div className='attackContainer'>
					{this.renderAttacks()}
				</div>
				<div className='spellContainer'>
					{this.renderSpells()}
				</div>
				{this.props.initiative}

				<i className='fa fa-times' onClick={this.props.remove} />
			</div>
		);
	}
});

module.exports = MonsterCard;
