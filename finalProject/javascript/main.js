
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
		var   b2Vec2 = Box2D.Common.Math.b2Vec2
          , b2BodyDef = Box2D.Dynamics.b2BodyDef
          , b2Body = Box2D.Dynamics.b2Body
          , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
          , b2Fixture = Box2D.Dynamics.b2Fixture
          , b2World = Box2D.Dynamics.b2World
          , b2MassData = Box2D.Collision.Shapes.b2MassData
          , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
          , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
          , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
          ;

	    // Box2D world
	    var world = new b2World (
	    	new b2Vec2(0, 10), true); // gravity and allowing sleep

	    // define the ground
	    var fixDef = new b2FixtureDef;
	    fixDef.density = 1.0;
	    fixDef.friction = 0.5;
	    fixDef.restitution = 0.2; // bounciness

	    var bodyDef = new b2BodyDef;
	    bodyDef.type = b2Body.b2_staticBody;
	// }

    // loadScript('javascript/Box2dWeb-2.1.a.3.min.js', Box2DCode);

}