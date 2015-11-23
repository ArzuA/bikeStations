var jQuery = require('js-toolbox')._jQuery;

var torontoBikes = function (req, res, next, callback){
	jQuery.ajax({url:"http://www.bikesharetoronto.com/stations/json"})
	.done(function(data){
		res.setHeader("Content-Type", "application/json");
		res.end(data);
		if(callback)callback(null);
	}).fail(function(err){
		console.log(err);
		res.send(err.status, err.code);	
		if(callback)calback(err);
	});
}


module.exports.torontoBikes = torontoBikes;