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
			status : 'normal',
			usedItems : [],
			lastRoll : { },
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

	addUsed : function(item, shouldRemove){
		if(!shouldRemove) this.state.usedItems.push(item);
		if(shouldRemove) this.state.usedItems.splice(this.state.usedItems.indexOf(item), 1);

		this.setState({
			usedItems : this.state.usedItems
		});
	},


	renderHPBox : function(){
		var self = this;

		var tempHP
		if(this.state.tempHP){
			var sign = (this.state.tempHP > 0 ? '+' : '');
			tempHP = <span className='tempHP'>{['(',sign,this.state.tempHP,')'].join('')}</span>
		}

		return <div className='hpBox' onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp}>
			<div className='currentHP'>
				{tempHP} {this.props.currentHP}
			</div>
			{self.renderStats()}
		</div>
	},

	renderStats : function(){
		var stats = {
			'fa fa-shield' : this.props.ac,
			//'fa fa-hourglass-2' : this.props.initiative,
		}
		return _.map(stats, function(val, icon){
			return <div className='stat' key={icon}> {val} <i className={icon} /></div>
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

	renderItems : function(){
		var self = this;
		var usedItems = this.state.usedItems.slice(0);
		return _.map(this.props.items, function(item, index){
			var used = _.contains(usedItems, item);
			if(used){
				usedItems.splice(usedItems.indexOf(item), 1);
			}
			return <span
				key={index}
				className={cx({'used' : used})}
				onClick={self.addUsed.bind(self, item, used)}>
				{item}
			</span>
		});
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
				<div className='info'>
					<span className='name'>{this.props.name}</span>
				</div>

				<div className='attackContainer'>
					{this.renderAttacks()}
				</div>
				<div className='spellContainer'>
					{this.renderSpells()}
				</div>

				<div className='abilitiesContainer'>
					{this.props.abilities}
				</div>
				<div className='itemContainer'>
					<i className='fa fa-flask' />
					{this.renderItems()}
				</div>
			</div>
		);
	}
});

module.exports = MonsterCard;

/*


{this.props.initiative}

<i className='fa fa-times' onClick={this.props.remove} />
*/