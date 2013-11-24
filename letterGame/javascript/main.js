
window.onload = function () {
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // via http://blog.sethladd.com/2011/09/box2d-javascript-example-walkthrough.html
    window.requestAnimFrame = (function(){
          return  window.requestAnimationFrame       || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame    || 
                  window.oRequestAnimationFrame      || 
                  window.msRequestAnimationFrame     || 
                  function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                  };
    })();

    // Following method wraps the Box2d Code inside a function-variable so that it's not called until
    // the Box2D library has loaded. Does not seem to be necessary, but keeping it here,
    // commented out, for reference. 

    // make sure scripts load in time
    // http://stackoverflow.com/questions/950087/how-to-include-a-javascript-file-in-another-javascript-file
    // function loadScript(url, callback) {
    // 	var head = document.getElementsByTagName('head')[0];
    // 	var box2DScript = document.createElement('script');
    // 	box2DScript.type = 'text/javascript';
    // 	box2DScript.src = url;

    // 	box2DScript.onreadystatechange = callback;
    // 	box2DScript.onload = callback;

    // 	// load the script
    // 	head.appendChild(box2DScript);
    // }

    // var Box2DCode = function () { 
	var     b2Vec2 = Box2D.Common.Math.b2Vec2
        ,   b2AABB = Box2D.Collision.b2AABB
        ,   b2BodyDef = Box2D.Dynamics.b2BodyDef
        ,   b2Body = Box2D.Dynamics.b2Body
        ,   b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        ,   b2Fixture = Box2D.Dynamics.b2Fixture
        ,   b2World = Box2D.Dynamics.b2World
        ,   b2MassData = Box2D.Collision.Shapes.b2MassData
        ,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        ,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        ,   b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        ,   b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
        ;

    // Box2D world
    var world = new b2World (
    	new b2Vec2(0, 9.8), true); // gravity and allowing sleep

    var SCALE = 30;

    // short functions just to make conversion to b2d units a little less bulky
    function pixels(pixels) {
    	return pixels / SCALE;
    }

    function halfPixels(pixels) {
		return pixels / SCALE * 0.5;    	
    }

    var canvas = document.getElementById("canvas");

    // set up generic fixDef and bodyDef variables
    // fixture definitions are attributes
    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2; // bounciness

    // body definition includes position in the world and whether dynamic or static
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;

    // define the ground

    // position is in the center of the object
    bodyDef.position.x = halfPixels(canvas.width);
    bodyDef.position.y = pixels(canvas.height);

    // define the actual shape
    // uses half-height and half-width as dimensions
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(halfPixels(canvas.width), halfPixels(10));
    // add the ground to the world
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    // left wall
    bodyDef.position.x = 0;
    bodyDef.position.y = halfPixels(canvas.height);
    fixDef.shape.SetAsBox(halfPixels(10), halfPixels(canvas.height));
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    // right wall
    bodyDef.position.x = pixels(canvas.width);
    bodyDef.position.y = halfPixels(canvas.height);
    fixDef.shape.SetAsBox(halfPixels(10), halfPixels(canvas.height));
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    // add some random bodies to the world
    bodyDef.type = b2Body.b2_dynamicBody;
    for (var i = 0; i < 10; i++) {
    	if (Math.random() > 0.5) {
    		fixDef.shape = new b2PolygonShape;
    		var randWidth = Math.random() * 20 + 30; 	// number btwn 30 and 50 
    		var randHeight = Math.random() * 20 + 30; 	// number btwn 30 and 50
    		console.log ("shape # " + i + ": Width: " + randWidth + " Height: " + randHeight);
    		fixDef.shape.SetAsBox (halfPixels(randWidth), halfPixels(randHeight)); // half-width, half-height
    	} else {
    		var randRadius = Math.random() * 10 + 15; 	// number btwn 15 and 25
    		fixDef.shape = new b2CircleShape (pixels(randRadius)); // radius
    		console.log ("shape # " + i + ": randRadius: " + randRadius);
    	}

    	var randPosX = (Math.random() * (canvas.width - 50)) + 25; // give 25-pixel buffer on each side
    	var randPosY = Math.random() * canvas.height * 0.5; // top half of screen only
    	bodyDef.position.x = pixels(randPosX);
    	bodyDef.position.y = pixels(randPosY);
    	world.CreateBody(bodyDef).CreateFixture(fixDef);
    }

    // draw the world
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(canvas.getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);

    // create the animation loop
    function update() {
	    // stepping through the simulation
	    // parameters are time step, velocity iteration count, and position iteration count 
	    world.Step(1/60, 10, 10);
	    world.DrawDebugData();
	    world.ClearForces();

	    requestAnimFrame(update);
    }

    // fire it up with one call
    requestAnimFrame(update);
	// }

    // loadScript('javascript/Box2dWeb-2.1.a.3.min.js', Box2DCode);
}