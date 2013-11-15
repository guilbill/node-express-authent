/**
 * Module dependencies.
 */

var express = require('express');

var host = "localhost";
var port = "27017";
var database = "IUT-METZ"
var databaseUrl = host+":"+port+"/"+database; 
var collections = ["todos", "users"];
var db = require("mongojs").connect(databaseUrl, collections);


var app = express();

function requiresLogin(req,res,next) {
	console.log("on test si la session existe");
	if(req.session.user){
		console.log("elle existe");
		console.log("Et elle vaut : " + req.session.user);
		next()
	} else {
		console.log("elle n'existe pas");
		res.render('login.jade');
	}
};

app.configure(function(){
	app.set('views', __dirname + '/public/views');
  	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
  	app.use(express.cookieParser());
  	app.use(express.session({ secret: "mysecret" }));
});

app.get('/', requiresLogin, function(request, response) {
	console.log("On est connecté!");
	console.log(request.session.user);
	response.render("welcome.jade",request.session.user);
});

app.post("/user/login", function(request, response){
	db.users.find({_id:request.body.email}, function(error, user){
		if (user.length == 0 || user[0].password != request.body.password){
	    	response.render('login.jade',{messageError:"Mauvais login ou mot de passe"});
		} else {
			request.session.user = user[0];
			console.log(request.session.user);
			response.render("welcome.jade",request.session.user);
		}
	});
});

app.post("/user/register", function(request, response){
	db.users.find({_id:request.body.email}, function(error, user){
		if (user.length == 0){
			var user = {_id:request.body.email, password:request.body.password};
			db.users.insert(user);
			request.session.user = user;
			console.log(request.session.user);
			response.render('welcome.jade',request.session.user);
	    } else {
			response.render('login.jade',{messageError:"L'utilisateur existe déjà"});
		}
		
	});
});

app.get("/user/logout", function(request, response){
	if(request.session.user){
		request.session.user=undefined;
	}
	response.render('login.jade');
});

app.listen(8080);
console.log('Express server listening on port 8080');