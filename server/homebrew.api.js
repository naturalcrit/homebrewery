var _ = require('lodash');
var Moment = require('moment');
var HomebrewModel = require('./homebrew.model.js').model;

var homebrewTotal = 0;
var refreshCount = function(){
	HomebrewModel.count({}, function(err, total){
		homebrewTotal = total;
	});
};
refreshCount()

var mw = {
	adminOnly : function(req, res, next){
		if(req.query && req.query.admin_key == process.env.ADMIN_KEY){
			next();
		}else{
			return res.status(401).send('Access denied');
		}
	}
};


var getTopBrews = function(cb){
	HomebrewModel.find().sort({views: -1}).limit(5).exec(function(err, brews) {
		cb(brews);
	});
}


module.exports = function(app){

	app.get('/homebrew/top', function(req, res){
		getTopBrews(function(topBrews){
			return res.json(topBrews);
		});
	});

	app.post('/homebrew/api', function(req, res){
		var newHomebrew = new HomebrewModel(req.body);
		newHomebrew.save(function(err, obj){
			if(err) return;
			return res.json(obj);
		})
	});

	app.put('/homebrew/api/update/:id', function(req, res){
		HomebrewModel.find({editId : req.params.id}, function(err, objs){
			if(!objs.length || err) return res.status(404).send("Can not find homebrew with that id");
			var resEntry = objs[0];
			resEntry.text = req.body.text;
			resEntry.title = req.body.title;
			resEntry.updatedAt = new Date();
			resEntry.save(function(err, obj){
				if(err) return res.status(500).send("Error while saving");
				return res.status(200).send(obj);
			})
		});
	});

	app.get('/homebrew/api/remove/:id', function(req, res){
		HomebrewModel.find({editId : req.params.id}, function(err, objs){
			if(!objs.length || err) return res.status(404).send("Can not find homebrew with that id");
			var resEntry = objs[0];
			resEntry.remove(function(err){
				if(err) return res.status(500).send("Error while removing");
				return res.status(200).send();
			})
		});
	});

	//Removes all empty brews that are older than 3 days and that are shorter than a tweet
	app.get('/homebrew/api/invalid', mw.adminOnly, function(req, res){
		var invalidBrewQuery = HomebrewModel.find({
			'$where' : "this.text.length < 140",
			createdAt: {
				$lt: Moment().subtract(3, 'days').toDate()
			}
		});

		if(req.query.do_it){
			invalidBrewQuery.remove().exec((err, objs)=>{
				refreshCount();
				return res.send(200);
			})
		}else{
			invalidBrewQuery.exec((err, objs)=>{
				if(err) console.log(err);
				return res.json({
					count : objs.length
				})
			})
		}
	});


	app.get('/homebrew/api/search', mw.adminOnly, function(req, res){
		var page = req.query.page || 0;
		var count = req.query.count || 20;

		var query = {};
		if(req.query && req.query.id){
			query = {
				"$or" : [{
					editId : req.query.id
				},{
					shareId : req.query.id
				}]
			};
		}

		HomebrewModel.find(query, {
			text : 0 //omit the text
		}, {
			skip: page*count,
			limit: count*1
		}, function(err, objs){
			if(err) console.log(err);
			return res.json({
				page : page,
				count : count,
				total : homebrewTotal,
				brews : objs
			});

		});
	})




	return app;
}