var _ = require('lodash');

module.exports = function(notation){
	notation = notation.replace(/ /g,'');
	var parts = notation.split(/(?=[\-\+])/g);

	return _.reduce(parts, function(r, part){
		if(!_.isNumber(r)) return r;
		var res = 0;
		var neg = false;
		if(part[0] == '-') neg = true;
		if(part[0] == '-' || part[0] == '+') part = part.substring(1);

		//Check for dice
		if(part.indexOf('d') !== -1){
			var numDice = part.split('d')[0];
			var die = part.split('d')[1];

			var diceRolls = _.times(numDice, function(){
				return _.random(1, die);
			});
			res = _.sum(diceRolls);
			if(numDice == 1 && die == 20){
				if(diceRolls[0] == 1)  return 'Fail!';
				if(diceRolls[0] == 20) return 'Crit!';
			}
		}else{
			res = part * 1;
		}
		return r + (neg ? -res : res);
	}, 0)
}
