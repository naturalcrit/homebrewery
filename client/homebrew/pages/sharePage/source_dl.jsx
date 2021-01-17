const sourceDL = function(res, brew) {
	const fileName = brew.title.replaceAll(' ', '-').replaceAll(':', '').replaceAll('/', '');

	res.status(200);
	res.set({
		'Cache-Control'       : 'no-cache',
		'Content-Type'        : 'text/plain',
		'Content-Disposition' : `attachment; filename="HomeBrewery-${fileName}.txt"`
	});

	return res;
};

module.exports = sourceDL;