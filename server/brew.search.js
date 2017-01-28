const _ = require('lodash');

module.exports = (Brew) => {
	const cmds = {
		termSearch : (terms='', opts, fullAccess) => {
			let query = {};
			if(terms){
				query = {$text: {
					//Wrap terms in quotes to perform an AND operation
					$search: _.map(terms.split(' '), (term)=>{
						return `\"${term}\"`;
					}).join(' '),
					$caseSensitive : false
				}};
			}
			return cmds.search(query, opts, fullAccess);
		},

		userSearch : (username, fullAccess) => {
			const query = {
				authors : username
			};

			return cmds.search(query, {}, fullAccess);
		},

		search : (queryObj={}, options={}, fullAccess = true) => {
			const opts = _.merge({
				limit : 25,
				page  : 0,
				sort  : {}
			}, options);
			opts.limit = _.toNumber(opts.limit);
			opts.page = _.toNumber(opts.page);

			let filter = {
				text : 0
			};

			if(!fullAccess){
				filter.editId = 0;
				queryObj.published = true;
			}

			const searchQuery = Brew
				.find(queryObj)
				.sort(opts.sort)
				.select(filter)
				.limit(opts.limit)
				.skip(opts.page * opts.limit)
				.lean()
				.exec();

			const countQuery = Brew.count(queryObj).exec();

			return Promise.all([searchQuery, countQuery])
				.then((result) => {
					return {
						brews : result[0],
						total : result[1]
					}
				});
		}
	};
	return cmds;
};