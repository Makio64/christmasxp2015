var fs = require('fs');
var tasks = fs.readdirSync('./gulp/');

tasks.forEach(function(task) {
	if(task.slice(-3) != '.js') return;
	require('./gulp/' + task);
});
