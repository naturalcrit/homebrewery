
require('fixme')({
	path:                 process.cwd(),
	ignored_directories:  ['node_modules/**', '.git/**', 'build/**'],
	file_patterns:        ['**/*.js', '**/*.jsx', '**/*.less'],
	file_encoding:        'utf8',
	line_length_limit:    200
});