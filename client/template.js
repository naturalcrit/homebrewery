module.exports = function(vitreum){
	return `
<!DOCTYPE html>
<html>
	<head>
		<link href="//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
		<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
		<link rel="icon" href="/assets/homebrew/favicon.ico" type="image/x-icon" />
		<title>The Homebrewery - NaturalCrit</title>
		${vitreum.head}
	</head>
	<body>
		<main id="reactRoot">${vitreum.body}</main>
	</body>
	${vitreum.js}
</html>
`;
};



