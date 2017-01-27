const _ = require('lodash');

module.exports = (Brew) => {
	const cmds = {
		termSearch : (terms='', opts, fullAccess) => {
			const query = {$text: {
				//Wrap terms in quotes to perform an AND operation
				$search: _.map(terms.split(' '), (term)=>{
					return `\"${term}\"`;
				}).join(' '),
				$caseSensitive : false
			}};
			return cmds.search(query, opts, fullAccess);
		},

		userSearch : (username, opts, fullAccess) => {
			const query = {
				authors : username
			};

			return cmds.search(query, opts, fullAccess);
		},

		search : (queryObj={}, opts={}, fullAccess = true) => {
			const pagination = _.defaults(opts.pagination, {
				limit : 25,
				page  : 0
			});
			const sorting = _.defaults(opts.sorting, {
				'views' : 1
			});
			let filter = {
				text : 0
			};
			if(!fullAccess){
				filter.editId = 0;
				queryObj.published = false;
			}

			const searchQuery = Brew
				.find(queryObj)
				.sort(sorting)
				.select(filter)
				.limit(pagination.limit)
				.skip(pagination.page * pagination.limit)
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