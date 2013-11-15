# Exemple de login/register simple avec Node.js, express, jade et mongoDB
## L'application
Le but de cette application est de montrer de manière simple une façon de se logger ou de s'enregistrer.
Elle est composé d'une page de login sur laquelle il est possible de se logger ou de s'enregistrer.
### Utilisation d'express
#### Déclaration des ressources statiques.
Express permet de gérer des ressources statiques pour son application, pour cela il suffit de mettre ses ressources statiques dans un dossier (par convention "/public"), et d'indiquer à express l'emplacement de ce dossier :
	
	app.use(express.static(__dirname + '/public'));

Ainsi nous pourrons faire référence aux fichier statique en utilisant le chemin :

	/public/chemin_vers_mon_fichier

Par exemple :
	
	link(rel="stylesheet", type="text/css", href="/public/css/bootstrap.css")

### Utilisation de jade
#### Déclaration des vues
De la même manière que pour les ressources statiques, nous devons indiqué à express où se trouvent les vues :
	
	app.set('views', __dirname + '/public/views');

Nous devons également indiqué à express que nous allons utiliser le moteur de rendu jade :
  	
  	app.set('view engine', 'jade');
  	
#### Les vues
[jade](http://jade-lang.com/) est un moteur de template. Son utilisation n'étant pas le but de cet exemple je ne détaillerai pas son utilisation. Pour plus d'information vous pouvez vous rendre sur le site de [jade](http://jade-lang.com/).
### Utilisation de MongoDB
#### mongojs
mongojs est un module Node.js facilitant l'utilisation de l'api mongoDB de Node.js. Son utilisation est très simple, voir le github de [mongojs](https://github.com/mafintosh/mongojs)
### Fonctionnement
#### Routing
Nous déclarons les points d'entrée suivants :
- GET / : Le premier point d'entrée retourne un rendu de la page de login.
- POST /user/login : Le deuxième va rechercher en base un utilisateur ayant le login indiqué (j'ai défini le login comme étant l'id de la collection users). Si il trouve un utilisateur, il compare le mot de passe saisi et le mot de passe en base. Affiche un message d'erreur si l'utilisateur n'existe pas ou si le mot de passe est incorrect, et retourne le rendu de la page welcome.jade si tout est bon.
- POST /user/register : Le troisième point d'entrée va insérer dans la base le login et mot de passe saisi.

### Les sessions
#### Callback
Express permet de déclarer plusieurs callback à la fonction de routing (voir la [doc](http://expressjs.com/api.html#app.VERB)).

	app.get('/', requiresLogin, function(request, response) {
		console.log("On est connecté!");
		console.log(request.session.user);
		response.render("welcome.jade",request.session.user);
	});
Dans l'exemple ci dessus, on utilise 2 callback, la première pour vérifier que l'utilisateur est bien authentifié, et la deuxième pour le rendu de la page.
Regardons plus en détail la fonction requiresLogin :

	function requiresLogin(req,res,next) {
		console.log("on test si la session existe");
		if(req.session.user){
			next();
		} else {
			res.render('login.jade');
		}
	};

Elle est vraiment très simple, on vérifie que la variable de session "user" existe, si oui, alors on est authentifié et on continue (next()), sinon, on redirige vers la page de login.

### Login
Lors du login il faut bien évidemment enregistrer une variable dans la session afin de pouvoir identifier l'utilisateur et savoir si il est loggué.

	app.post("/user/login", function(request, response){
		db.users.find({_id:request.body.email}, function(error, user){
			if (user.length == 0 || user[0].password != request.body.password){
		    	response.render('login.jade',{messageError:"Mauvais login ou mot de passe"});
			} else {
				request.session.user = user[0];
				response.render("welcome.jade",request.session.user);
			}
		});
	});
Si les login/mdp sont bon, il suffit d'enregistrer une variable de session. Ici nous enregistrons dans la variable "user" et nous enregistrons directement l'objet User, ce qui permettra de faciliter certains traitements lorsque nous aurons besoin de récupérer les information de l'utilisateur connecté. 
Nous faison la même chose lors de l'enregistrement.

### Logout
Enfin, nous devons pouvoir faire un logout. Pour cela il suffit que la variable de session ne soit pas définie :

	app.get("/user/logout", function(request, response){
		if(request.session.user){
			request.session.user=undefined;
		}
		response.render('login.jade');
	});

## Attention
Cet exemple est très simplifié, il ne comprends pas le contrôle des champs ni l'encryptage du mot de passe (ne jamais enregistrer un mot de passe en clair!!!)...

