//--------------------------------------------------------------------------------TOOLBOX
const genDistance=400; //ditance to generate new entities (so that they don't appear randomly on the screen but hidden over the screen)
const genHeight=450; //range from 0 to genHeight where an entity can be generated (y-axis)
const genWidth=700; //range from 0 to genWidth where an entity can be generated (x-axis)
const camTrackingHeight=400; //max distance for gribouilleur unless the camera starts moving up for the tracjing
const camTrackingStep=4; //number of px for a camera step
const deathLimit =900; //maximum height (bottom of the screen) where an entity can live, over 900 the entity is killed

var proba = (i)=> Math.floor(Math.random()*i)<1; //Generates a boolean based on a 1/i probability
var rand = (i)=> Math.floor(Math.random()*i); //Generates a random number














//============================================================================================================= ALL CLASSES
//---------------------------------------------------------------------------------MAIN ENTITY CLASS
var Entity = function( px, py, w, h){		//This is our main object class
	this.pos    = {x:px, y:py};
	this.width  = w;
	this.height = h;
}
Entity.prototype.collision = function( pos,w,h ){ //Generic function to detect collisions
	return pos.x>= this.pos.x-this.width/2 && pos.x <= this.pos.x+this.width && pos.y >= this.pos.y-h && pos.y <= this.pos.y+this.height;
}
Entity.prototype.getPosition = function(){return this.pos;} //Generic function to get any entity position
Entity.prototype.getW = function(){return this.width;}  //Generic function to get any entity width
Entity.prototype.getH = function(){return this.height;} //Generic function to get any entity height
Entity.prototype.xmove = function(amount){this.pos.x += amount;} //Generic function for an entity to move on the x-axis
Entity.prototype.xTeleport = function(amount){this.pos.x = amount;} //Generic function to teleport any entity anywhere on x axis (used to remove screen borders)
Entity.prototype.camMove = function(i){this.pos.y+=i;} //Generic function to move any entity down so that we can make our camera tracking correctly
Entity.prototype.yTeleport = function(amount){this.pos.y = amount;} //Generic function to teleport any entity anywhere on y axis


//---------------------------------------------------------------------------------GRIBOUILLEUR
var Gribouilleur = function(){
	Entity.call(this, 365, 830, 70, 70);
  this.jumping=true; //Is gribouilleur currently jumping (allows us to know rather if an amount of px should be added or substracted to gribouilleur's height)
	this.maxJumpHeight=450; //Default maximum jump height of gribouilleur
  this.jumpHeight=0; //current jump height of gribouilleur
	this.dead=false; //is the gribouilleur dead
	this.state='n'; //gribouilleur's state (this will change it's appearance based on the items gribouilleur will use)
	this.isFlying=false; //defines if gribouilleur is flying
}
Gribouilleur.prototype = Object.create(Entity.prototype);
Gribouilleur.prototype.constructor = Gribouilleur;
Gribouilleur.prototype.boost = function(amount){this.maxJumpHeight=amount;} //This function is called to allow gribouilleur to jump higher when using a boosting platform
Gribouilleur.prototype.getCorrepsondingValueOfSpeed = function(){ //this function returns for any current jumpheight a value of px for the gribouilleur to move this allows the gribouilleur to move smoothly with a more realistic jump curve  : gribouilleur will go faster at the beginning of a new jump than at the end of a jump
	if(this.maxJumpHeight<451) return Math.round(5-0.0111111*this.jumpHeight);
	else if(this.maxJumpHeight<901) return Math.round(9-0.01*this.jumpHeight); //mathematical function for "ressort" plateforme which doubles gribouilleur's maxJumpHeight
	else if(this.maxJumpHeight<1801) return Math.round(13-0.00722222*this.jumpHeight); //mathematical function for "trampoline" plateforme which quadruples gribouilleur's maxJumpHeight
}
Gribouilleur.prototype.move = function(){
	if(this.getPosition().x>800)this.xTeleport(1); //teleport if out of screen right
	else if(this.getPosition().x<0)this.xTeleport(799); //teleport if out of screen left
	if(this.pos.y<=0)this.yTeleport(1);//make gribouilleur not getting out of the screen

  if(this.jumping && this.jumpHeight<this.maxJumpHeight){ //If is jumping & can still jump
    this.pos.y-=this.getCorrepsondingValueOfSpeed(); //move gribouilleur
    this.jumpHeight+=this.getCorrepsondingValueOfSpeed(); //modify the current jumpHeight
  }
  if(this.jumpHeight>=this.maxJumpHeight-this.height){ //If gribouilleur should now fall
		this.jumping=false; //stops jumping
		this.isFlying=false;//reset gribouilleur's fly
	}
  if(!this.jumping){ //If gribouilleur should fall
		if(!this.isFlying){ //normal falling
			this.pos.y+=this.getCorrepsondingValueOfSpeed(); //move gribouilleur
			this.jumpHeight-=this.getCorrepsondingValueOfSpeed(); //modify the current jumpHeight
		}else{ //avoid falling too fast after a fly
			this.pos.y+=3; //move gribouilleur
			this.jumpHeight-=3; //modify the current jumpHeight
		}
  }
}


//---------------------------------------------------------------------------------PLATEFORME BASIQUE
var Plateforme = function(px,py){ Entity.call(this, px, py, 90, 15) }
Plateforme.prototype = Object.create(Entity.prototype);
Plateforme.prototype.constructor = Plateforme;
//-------------------------------------------------------Plateforme Pourrie
var PlateformePourrie = function(px,py){ Plateforme.call(this, px, py) } //This plateforme will break on collision
PlateformePourrie.prototype = Object.create(Plateforme.prototype);
PlateformePourrie.prototype.constructor = PlateformePourrie;
//-------------------------------------------------------Plateforme Horizontale
var PlateformeH = function(px,py){
	Plateforme.call(this, px, py);
  this.sens=0; //defines the platform direction
}
PlateformeH.prototype = Object.create(Plateforme.prototype);
PlateformeH.prototype.constructor = PlateformeH;
PlateformeH.prototype.move = function(){
  if(this.pos.x < 0)this.sens=1; //changes plateforme's direction if it touches a border
  else if(this.pos.x > 710)this.sens=0;
  if(this.sens==0)this.pos.x-=1; //moves the platform horizontally
  else this.pos.x+=1;
}
//-------------------------------------------------------Plateforme Verticale
var PlateformeV = function(px,py){
	Plateforme.call(this, px, py);
  this.variation=0; //defines the curent platform vertical variation (px)
	this.sens=0; //defines the platform direction
}
PlateformeV.prototype = Object.create(Plateforme.prototype);
PlateformeV.prototype.constructor = PlateformeV;
PlateformeV.prototype.move = function(){
  if(this.variation > 90){ //if variation reach its max amount
		this.variation=0; //reset variation
		if(this.sens==1)this.sens=0; //change plateform vertical direction
		else this.sens=1;
	}
  if(this.sens==0){
		this.pos.y-=1; //moves platform
		this.variation++;	//grows variation
	}
  else{
		this.pos.y+=1;
		this.variation++;
	}
}
//-------------------------------------------------------Plateforme Boost
var PlateformeBoost = function(px,py,amount){
	Plateforme.call(this, px, py);
	this.amount=amount;
}
PlateformeBoost.prototype = Object.create(Plateforme.prototype);
PlateformeBoost.prototype.constructor = PlateformeBoost;


//-------------------------------------------------------------------------------MONSTRE
var Monster = function(px,py){Entity.call(this, px, py, 90, 90);} //A monster
Monster.prototype = Object.create(Entity.prototype);
Monster.prototype.constructor = Monster;
//-------------------------------------------------------Monstre à mouvement Horizontal
var MonsterH = function(px,py){
	Monster.call(this, px, py);
  this.sens=0;
}
MonsterH.prototype = Object.create(Monster.prototype);
MonsterH.prototype.constructor = MonsterH;
MonsterH.prototype.move = function(){ //works almost the same way as horizontally moving platforms
  if(this.pos.x < 0)this.sens=1;
  else if(this.pos.x > 710)this.sens=0;
  if(this.sens==0)this.pos.x-=1;
  else this.pos.x+=1;
}
//-------------------------------------------------------Monstre à mouvement Vertical
var MonsterV = function(px,py){
	Monster.call(this, px, py);  //works almost the same way as vertically moving platforms
  this.variation=0;
	this.sens=0;
}
MonsterV.prototype = Object.create(Monster.prototype);
MonsterV.prototype.constructor = MonsterV;
MonsterV.prototype.move = function(){
  if(this.variation > 90){
		this.variation=0;
		if(this.sens==1)this.sens=0;
		else this.sens=1;
	}
  if(this.sens==0){
		this.pos.y-=1;
		this.variation++;
	}
  else{
		this.pos.y+=1;
		this.variation++;
	}
}


//-------------------------------------------------------------------------------Base class for any item
var Item = function(px,py){ Entity.call(this, px, py, 50, 50) }
Item.prototype = Object.create(Entity.prototype);
Item.prototype.constructor = Item;
//-------------------------------------------------------Helicopter hat
var Helico = function(px,py){ Item.call(this, px, py) }
Helico.prototype = Object.create(Item.prototype);
Helico.prototype.constructor = Helico;
//-------------------------------------------------------Jetpack
var Jetpack = function(px,py){ Item.call(this, px, py) }
Jetpack.prototype = Object.create(Item.prototype);
Jetpack.prototype.constructor = Jetpack;
//-------------------------------------------------------Rocket
var Rocket = function(px,py){ Item.call(this, px, py) }
Rocket.prototype = Object.create(Item.prototype);
Rocket.prototype.constructor = Rocket;
//-------------------------------------------------------Potions
var Potion = function(px,py){ Item.call(this, px, py) }
Potion.prototype = Object.create(Item.prototype);
Potion.prototype.constructor = Potion;















//----------------------------------------------------------------------------------------------------MODEL
var model = {
	//To reduce as much as possible the function calls i choosed forget the init as it's not really needed in this case and directly give values to var / I'm optimizing as much as posible the game to run it smoothly
	gribouilleur : new Gribouilleur(),
  plateformes :[new Plateforme(355,600), new Plateforme(355,400),new Plateforme(355,200)],
	monsters : [],
	items :[],
  distance : 0, //the distance in px gribouilleur made, this is later used as a score

	//alows gribouilleur to fly thanks to effects
	flyGrib : function(duration){
			var startTime = new Date().getTime();
			model.gribouilleur.jumping=false; //stops the current jump
			model.gribouilleur.jumpHeight=200;
			var interval = setInterval(function(){ //during <duration> the jump will be reseted to its beggining each 10ms
					if(new Date().getTime() - startTime > duration){ //stops interval after <duration>
							clearInterval(interval);
							model.gribouilleur.jumping=false; //reset jumping
							model.gribouilleur.jumpHeight=200;
							model.gribouilleur.state='n'; //reset gribouilleur's state for it to recover its main yellow look
							return;
					}
					model.gribouilleur.isFlying=true;
					model.gribouilleur.jumping=true;
					model.gribouilleur.jumpHeight=0;
			 }, 50);
	},

	//makes gribouilleur invicible during <duration>
	ultraGrib : function(duration){
			var startTime = new Date().getTime();
			var interval = setInterval(function(){ //during <duration> the gribouilleur dead state will be set to false each 10ms
					if(new Date().getTime() - startTime > duration){ //stops interval after <duration>
							clearInterval(interval);
							model.gribouilleur.state='n'; //reset gribouilleur's state for it to recover its main yellow look
							return;
					}
					model.gribouilleur.dead=false;
			 }, 50);
	},

	//we have only one update function to avoid code duplication to optimize our game
  updateBoard : function(){
		//---------------------------------------------------------------VARS DECLARATION
		allEntities=[this.gribouilleur].concat(this.items.concat(this.plateformes.concat(this.monsters)));
		allEntitiesArray=[this.items,this.plateformes,this.monsters];
		difficulty = this.distance/160;//Used later to increase the difficulty of platforme generation
		//--------------------------------------------------------------SUB ALGORITHMS
		//Kill dead entities
		allEntitiesArray.forEach((item, i) => {
			item.forEach((elt, j) => {
				if(elt.getPosition().y>deathLimit) item.splice(j,1)
			});
		});
		//Minimal required platforme generation
    isThereAnAvailablePlatform=false;
    this.plateformes.forEach((item, i) => {
			if(item.getPosition().y>400-genDistance && item.getPosition().y<750-genDistance && !(item instanceof PlateformePourrie)) isThereAnAvailablePlatform=true;
		});
    if(!isThereAnAvailablePlatform) this.plateformes.push( new Plateforme(rand(genWidth),450-genDistance));
		//Random plateforme generation
		if(this.plateformes.length<8){ //give a chance to generate a platforme if their are not too many plateformes
			if(proba(50+difficulty)){ //Spawn chance of a plateforme
				rnd=rand(100); //Random type of plateforme
				if(rnd<60) this.plateformes.push( new Plateforme(rand(genWidth),rand(genHeight)-genDistance));
				else if(rnd<70) this.plateformes.push( new PlateformePourrie(rand(genWidth),rand(genHeight)-genDistance));
				else if(rnd<80) this.plateformes.push( new PlateformeH(rand(genWidth),rand(genHeight)-genDistance));
				else if(rnd<90) this.plateformes.push( new PlateformeV(rand(genWidth),rand(genHeight)-genDistance));
				else if(rnd<97) this.plateformes.push( new PlateformeBoost(rand(genWidth),rand(genHeight)-genDistance,900));
				else this.plateformes.push( new PlateformeBoost(rand(genWidth),rand(genHeight)-genDistance,1800));
			}
		}
		//Random Monster Generation
		if(this.monsters.length<4){ //give a chance to generate a monster if their are not too many monsters
			if(proba(2000)){ //probability to spawn a monster
				var o = rand(5); //random monster type
				if(o==5) this.monsters.push( new MonsterV(rand(genWidth),rand(genHeight)-genDistance)); //5= vertically moving monster
				else if(o==4) this.monsters.push( new MonsterH(rand(genWidth),rand(genHeight)-genDistance)); //4 =horizontally moving monster
				else this.monsters.push( new Monster(rand(genWidth),rand(genHeight)-genDistance)); //1-3 = basic mosnter
			}
		}
		//Random Item Generation
		if(this.items.length<3){ //give a chance to generate an item if their are not too many items
			if(proba(3000)){ //randomly generate an item
				var o = rand(100);
				if(o>90) this.items.push( new Rocket(rand(genWidth),rand(genHeight)-genDistance)); //item has 10% chance to be a Rocket
				else if(o>70 && o<90) this.items.push( new Jetpack(rand(genWidth),rand(genHeight)-genDistance)); //item has 20% chance to be a Helico
				else if(o>35 && o<70) this.items.push( new Potion(rand(genWidth),rand(genHeight)-genDistance)); //item has 35% chance to be a Potion
				else this.items.push( new Helico(rand(genWidth),rand(genHeight)-genDistance)); //item has 35% chance to be a Helico
			}
		}
		//Here happens all the magic of CAMERA TRAKING and MOVEMENTS
		verticalPos=this.gribouilleur.getPosition().y; //current gribouilleur height for camera tracking
		allEntities.forEach((item, i) => { //for each entity on the board
			if(item instanceof Gribouilleur || item instanceof PlateformeH || item instanceof PlateformeV || item instanceof MonsterH || item instanceof MonsterV) item.move(); //move it if it movable
			if(verticalPos<=camTrackingHeight) item.camMove(camTrackingStep); //lower all entities y positions if we need to track gribouilleur
		});
		if(verticalPos<=camTrackingHeight) this.distance+=camTrackingStep; //grow the distance which is used for scores calculation
  },

	//collision consequences
  findCollision : function(){
		var g = this.gribouilleur;
		var allEntitiesArray=[this.items,this.plateformes,this.monsters];
		allEntitiesArray.forEach((array) => {
			array.forEach((item, i) => {
				if(item.collision(g.getPosition(),g.getW(),g.getH())){
					if(item instanceof Plateforme){
						if(!g.jumping && !g.dead){
							if(item instanceof PlateformePourrie) array.splice(i,1);
							else {
								g.jumping=true; //makes it jump again
								g.jumpHeight=0; //reset gribouilleur's jump height
								if(item instanceof PlateformeBoost) g.boost(item.amount); //if the platform is boosting gribouilleur then boosts gribouilleur maxJumpHeight
								else g.boost(450); //or reset its maxJumpHeight to its normal value
							}
						}
					}
					else if(item instanceof Monster) g.dead=true;
					else{
						if(item instanceof Helico) {this.flyGrib(2000);model.gribouilleur.state='h';} //makes gribouilleur fly 2s and set it to its helico state to adapt its look
						else if(item instanceof Jetpack) {this.flyGrib(4000);model.gribouilleur.state='j';} //makes gribouilleur fly 4s and set it to its jetpack state to adapt its look
						else if(item instanceof Rocket) {this.flyGrib(6000);model.gribouilleur.state='r';} //makes gribouilleur fly 6s and set it to its rocket state to adapt its look
						else if(item instanceof Potion) {this.ultraGrib(15000);model.gribouilleur.state='i';} //makes gribouilleur invicible for 15s and set it to its potion state to adapt its look
						array.splice(i,1); //Removes item
					}
				}
			});
		});
	}

}
















//------------------------------------------------------------------------------------------------OCTOPUS
var octopus = {
	init : function(){ //init model and gribouilleur at the beginning of the game
		octopus.animationID = window.requestAnimationFrame(octopus.step);
		//CREATE ALL THE GAME CONTROLS
		document.onkeydown = onKeyDownListener;
		var keyLeft = false; //is left arrow pressed
		var keyRight = false; //is right arrow pressed
		function onKeyDownListener(evt) { //changes our keys boolean values if the right key is pressed
			 if(evt.keyCode == 37) keyLeft = true;
			 else if(evt.keyCode == 39) keyRight = true;
		}
		document.onkeyup = function(evt){ //changes our keys boolean values if the right key is pressed
		 if(evt.keyCode == 37) keyLeft = false;
		 else if(evt.keyCode == 39) keyRight = false;
		}
		setInterval(function(){ //moves gribouilleur if our boolean variables are true   -   making it this way allows to have a smooth movement for gribouilleur (without any delays of keyPress which is not the case otherwise)
			if(keyLeft) model.gribouilleur.xmove(-8);
			else if(keyRight) model.gribouilleur.xmove(8);
		},20)
	},

  getPlateformes : function(){return model.plateformes;}, //getters for model's attributes
	getMonsters : function(){return model.monsters;},
	getItems : function(){return model.items;},
	getGribouilleur : function(){return model.gribouilleur;},

	step : function(){ //each frame of the game
		if (model.gribouilleur.pos.y > deathLimit){
			if(!alert('Fin de la partie ! Votre score est de '+Math.floor(model.distance/10) +'m ! \nAppuyez sur Entrée pour relancer la partie !'))window.location.reload();
		}
		else{
			model.findCollision(); //check for collisions and executes collision's consequences
			model.updateBoard(); //updates all entities on the board
			document.getElementById("game").innerHTML = ""; //clear board
			viewGribouilleur.render(); //draws entities on the board
      viewPlateformes.render();
			viewMonsters.render();
			viewItems.render();
			octopus.animationID = window.requestAnimationFrame(octopus.step); //next step
		}
	}
}


















//--------------------------------------------------------------------------------------------RENDERING
var viewGribouilleur = {
	render : function(){ //Renders gribouilleur on the board
		var tple = document.getElementById("template-grib");
		var infos=setOnBoard(tple,".defaultGrib",octopus.getGribouilleur().getPosition(),false);
		if(octopus.getGribouilleur().dead) infos[0].style.transform="rotate(180deg)"; //if the gribouilleur is dead rorate it 180° to show he is dead

		state=octopus.getGribouilleur().state; //Change appearance depending on the items gribouilleur took
		if (state=='h') infos[0].querySelector("img").src="img/gribouilleur/dHeli.png";
		else if (state== 'j') infos[0].querySelector("img").src="img/gribouilleur/dJet.png";
		else if (state== 'i') infos[0].querySelector("img").src="img/gribouilleur/dInvi.png";
		else if (state== 'r') infos[0].querySelector("img").src="img/gribouilleur/dFus.png";
		document.getElementById("game").appendChild(infos[1]);//Place it on the board
	}
}
var viewPlateformes = { //Renders plateformes on the board
	render : function(){
		octopus.getPlateformes().forEach((item, i) => {
			if(item instanceof PlateformePourrie) var tple = document.getElementById("template-plateformePourrie"); //changes the used template for plateforme rendering depending on plateforme type
			else if(item instanceof PlateformeH) var tple = document.getElementById("template-plateformeH");
			else if(item instanceof PlateformeV) var tple = document.getElementById("template-plateformeV");
			else if(item instanceof PlateformeBoost) var tple = (item.amount>900)? document.getElementById("template-plateformeTrampo") : document.getElementById("template-plateformeRessort");
			else var tple = document.getElementById("template-plateforme");
			setOnBoard(tple,"#plateforme",item.getPosition());
		});
	}
}
var viewItems = { //Renders items on the board
	render : function(){
		octopus.getItems().forEach((item, i) => {
			if(item instanceof Helico) var tple = document.getElementById("template-itemHelico");  //changes the used template for item rendering depending on item type
			else if(item instanceof Jetpack) var tple = document.getElementById("template-itemJetpack");
			else if(item instanceof Rocket) var tple = document.getElementById("template-itemRocket");
			else var tple = document.getElementById("template-itemPotion");
			setOnBoard(tple,"#item",item.getPosition());
		});
	}
}
var viewMonsters = { //Renders monsters on the board
	render : function(){
		octopus.getMonsters().forEach((item, i) => {
			if(item instanceof MonsterH) var tple = document.getElementById("template-monsterH");  //changes the used template for monster rendering depending on monster type
			else if(item instanceof MonsterV) var tple = document.getElementById("template-monsterV");
			else var tple = document.getElementById("template-monster");
			setOnBoard(tple,"#monster",item.getPosition());
		});
	}
}

function setOnBoard(tple, templateId, pos, go = true){ //UTILITY FUNCTION TO AVOID CODE DUPLICATION
	var frag = document.importNode(tple.content, true);
	var elem = frag.querySelector(templateId);
	elem.style.marginLeft = pos.x + "px";
	elem.style.marginTop  = pos.y + "px";
	if(go) document.getElementById("game").appendChild(frag); //Used for gribouilleur as we need to modify it more before placing him on the board
	else return [elem,frag];
}




//-------------------------------------------------------------------------------------INIT EVERYTHING
octopus.init();
//END OF OUR SCRIPT
