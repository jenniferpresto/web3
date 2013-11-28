/*****************************
Box 2D physics
Helpful tutorials and sites:

Nice walkthrough for beginners:
http://blog.sethladd.com/2011/09/box2d-javascript-example-walkthrough.html

Good code on interacting with mouse (joint interaction based heavily on this):
http://code.google.com/p/box2dweb/
(see downloads for actual code)

*****************************/

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

    // boolean to determine if boxes have rested so shelves can be created
    var gameStarted = false;
    var checkRun = false;
    var gameWon = false;

    // Box2D variables
	var     b2Vec2 = Box2D.Common.Math.b2Vec2
        ,   b2AABB = Box2D.Collision.b2AABB
        ,   b2BodyDef = Box2D.Dynamics.b2BodyDef
        ,   b2Body = Box2D.Dynamics.b2Body
        ,   b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        ,   b2Fixture = Box2D.Dynamics.b2Fixture
        ,   b2World = Box2D.Dynamics.b2World
        ,   b2MassData = Box2D.Collision.Shapes.b2MassData
        ,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        // ,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        ,   b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        ,   b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
        ,   b2ContactListener = Box2D.Dynamics.b2ContactListener
        ;

    // Box2D world
    var world = new b2World (
    	new b2Vec2(0, 9.8), true); // gravity and allowing sleep


    var SCALE = 30.0;

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');

    // set up generic fixDef and bodyDef variables
    // fixture definitions are attributes
    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2; // bounciness

    // body definition includes position in the world and whether dynamic or static
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;

    // define the floor
    // position is in the center of the object
    bodyDef.position.x = halfPixels(canvas.width);
    bodyDef.position.y = pixels(canvas.height);

    // define the actual shape
    // uses half-height and half-width as dimensions
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(halfPixels(canvas.width), halfPixels(10));
    // then add the floor to the world
    var floor = world.CreateBody(bodyDef).CreateFixture(fixDef);
    floor.SetUserData("floor");

    // do the same for the other walls
    // ceiling
    bodyDef.position.x = halfPixels(canvas.width);
    bodyDef.position.y = 0.0;
    fixDef.shape.SetAsBox(halfPixels(canvas.width), halfPixels(10));
    var ceiling = world.CreateBody(bodyDef).CreateFixture(fixDef);
    ceiling.SetUserData("ceiling");

    // left wall
    bodyDef.position.x = 0;
    bodyDef.position.y = halfPixels(canvas.height);
    fixDef.shape.SetAsBox(halfPixels(10), halfPixels(canvas.height));
    var leftWall = world.CreateBody(bodyDef).CreateFixture(fixDef);
    leftWall.SetUserData("leftWall");

    // right wall
    bodyDef.position.x = pixels(canvas.width);
    bodyDef.position.y = halfPixels(canvas.height);
    fixDef.shape.SetAsBox(halfPixels(10), halfPixels(canvas.height));
    var rightWall = world.CreateBody(bodyDef).CreateFixture(fixDef);
    rightWall.SetUserData("rightWall");

    // add 26 randomly sized rectangles to the world
    var NUMBOXES = 5;
    var boxArray = [];
    // array of images
    var imageArray = [];

    bodyDef.type = b2Body.b2_dynamicBody;
    for (var i = 0; i < NUMBOXES; i++) {
        // create rectangles
		fixDef.shape = new b2PolygonShape;
		var randWidth = Math.random() * 50 + 50; 	// number btwn 50 and 100 
		var randHeight = Math.random() * 50 + 50; 	// number btwn 50 and 100
		fixDef.shape.SetAsBox (halfPixels(randWidth), halfPixels(randHeight)); // half-width, half-height

        // determine their positions
    	var randPosX = (Math.random() * (canvas.width - 50)) + 25; // give 25-pixel buffer on each side
    	var randPosY = Math.random() * canvas.height * 0.5; // top half of screen only
    	bodyDef.position.x = pixels(randPosX);
    	bodyDef.position.y = pixels(randPosY);

        var newBody = world.CreateBody(bodyDef).CreateFixture(fixDef);
        newBody.SetUserData("box" + i.toString()); // giving it a custom ID, essentially
        // console.log("[", i, "]: ", newBody);
        boxArray.push(newBody);

        // load the images
        imageArray[i] = new Image();
        imageArray[i].src = '../letterGame/imgs/test' + i.toString() + '.png';
    }

    // draw the world
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(canvas.getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);

    // add mouse variables
    var mouseX, mouseY, mouseVec, mouseIsDown, selectedBody, mouseJoint;

    // transpose for the canvas position
    var canvasPosition = getElementPosition(document.getElementById("canvas"));
    // console.log("canvas top-left corner: ", canvasPosition);

    /*****************************
    Add listeners
    *****************************/

    document.addEventListener("mousedown", function(e) {
        mouseIsDown = true;
        handleMouseMove(e);
        document.addEventListener("mousemove", handleMouseMove, true);
        for (var i = 0; i < boxArray.length; i++) {
            // console.log("Box #", i, " angle: ", boxArray[i].m_body.GetAngle());
            // console.log("Transform: ", boxArray[i].m_body.GetTransform());
            console.log("Object [", i," ]: ", boxArray[i]);
            // console.log(getBoxCoordinates(boxArray[i]));
        }
        // console.log("Box 0 contact list: ", boxArray[0].m_body.GetContactList());
        // console.log("getBodyList: ", world.GetBodyList());
        
        // reset ability to check stacking order next time objects come to rest
        checkRun = false;

    }, true);

    document.addEventListener("mouseup", function() {
        document.removeEventListener("mousemove", handleMouseMove, true);
        mouseIsDown = false;
        mouseX = undefined;
        mouseY = undefined;
    }, true);

    // refigure canvas position if window is resized
    window.addEventListener("resize", function() {
        canvasPosition = getElementPosition(document.getElementById("canvas"));
        console.log("resizing! recalibrating!");
    }, true);

    // // add collision listener for the world
    // var contactListener = new b2ContactListener;
    // contactListener.BeginContact = function(contact) {
    //     console.log(contact.GetFixtureA().GetBody().GetUserData());
    //     console.log(contact.GetFixtureB().GetBody().GetUserData()); 
    // }
    // contactListener.EndContact = function(contact) {
    //     console.log(contact.GetFixtureA().GetBody().GetUserData());
    // }
    // contactListener.PostSolve = function(contact, impulse) {
        
    // }
    // contactListener.PreSolve = function(contact, oldManifold) {

    // }
    // world.SetContactListener(contactListener);


    /*****************************
    Defined functions
    *****************************/

    // short functions just to make conversion to b2d units a little less bulky
    function pixels(pixels) {
        return pixels / SCALE;
    }

    function halfPixels(pixels) {
        return pixels / SCALE * 0.5;        
    }

    function handleMouseMove(e) {
        mouseX = e.clientX - canvasPosition.x;
        mouseY = e.clientY - canvasPosition.y;
        // console.log("Mouse X: ", mouseX, ", Mouse Y: ", mouseY);
        getBodyAtMouse();
    }

    function getBodyAtMouse () {
        mouseVec = new b2Vec2(pixels(mouseX), pixels(mouseY));
        // Note: aabb stands for "axis-aligned bounding box"; used for testing collisions
        var aabb = new b2AABB();
        aabb.lowerBound.Set(pixels(mouseX) - 0.001, pixels(mouseY) - 0.001); 
        aabb.upperBound.Set(pixels(mouseX) + 0.001, pixels(mouseY) + 0.001);

        // look for overlapping shapes
        selectedBody = null;
        world.QueryAABB(getBodyCB, aabb);
        return selectedBody;
    }

    function getBodyCB (fixture) {

        if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {
            if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mouseVec)) {
                selectedBody = fixture.GetBody();
                return false;
            }
        }
        return true;
    }

    // function to calculate position of elements;
    // used for canvas element to get correct mouse positions
    function getElementPosition(element) {
        var elem = element;
        var tagname = "";
        var x = 0;
        var y = 0;
        while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
            x += elem.offsetLeft;
            y += elem.offsetTop;
            tagname = elem.tagName.toUpperCase();

            if (tagname == 'BODY') {
                elem = 0;
            }

            if (typeof(elem) == "object") {
                if(typeof(elem.offsetParent) == "object") {
                    elem = elem.offsetParent;
                }
            }
        }
        return {x: x, y: y};
    }

    // get top-left corner, width, and height of each box (in pixels)
    // To be used with drawing images.
    // Lord knows, I can't find a simpler way
    function getBoxCoordinates (boxObject) {
        var rot = boxObject.m_body.GetAngle();
        // m_vertices[2] always has positive numbers for x and y
        var x2 = boxObject.m_shape.m_vertices[2].x;
        var y2 = boxObject.m_shape.m_vertices[2].y;
        var w = x2 * 2.0 * SCALE;
        var h = y2 * 2.0 * SCALE;
        var topLeftX = (boxObject.m_body.GetPosition().x - x2) * SCALE;
        var topLeftY = (boxObject.m_body.GetPosition().y - y2) * SCALE;

        return {rotation: rot, width: w, height: h, x: topLeftX, y: topLeftY};
    }

    // this will create the shelves at the beginning of the game after
    // the blocks have settled
    function createShelves () {
        bodyDef.type = b2Body.b2_staticBody;

        // left side
        bodyDef.position.x = pixels(canvas.width / 4.0);
        bodyDef.position.y = pixels(canvas.height / 1.5);
        fixDef.shape.SetAsBox(halfPixels(150), halfPixels(10));
        var leftShelf = world.CreateBody(bodyDef).CreateFixture(fixDef);
        leftShelf.SetUserData("leftShelf");

        // right side
        bodyDef.position.x = pixels(canvas.width * 3.0 / 4.0);
        bodyDef.position.y = pixels(canvas.height / 1.5);
        fixDef.shape.SetAsBox(halfPixels(150), halfPixels(10));
        var rightShelf = world.CreateBody(bodyDef).CreateFixture(fixDef);
        rightShelf.SetUserData("rightShelf");
    }

    // function called any time all boxes at rest
    // checks stacking order of the boxes
    function checkStackingOrder () {
        console.log("checkingStackOrder");
        var correctBoxes = 0;
        for ( var i = 0; i < boxArray.length; i++ ) {
            // check box 0
            if (i==0) {
                var contactList0 = boxArray[i].m_body.m_contactList;
                console.log("contactList0: ", contactList0);
                // box0 should have two (and only two) contacts;
                // they should be the left shelf and box 1
                if (contactList0.contact && contactList0.next) {
                    if (contactList0.next.next == null) {
                        // now check to make sure one of the contacts is the left shelf,
                        // and the other is box1
                        console.log(contactList0.contact.m_fixtureA.m_userData);
                        if ((contactList0.contact.m_fixtureA.m_userData == 'leftShelf' ||contactList0.contact.m_fixtureB.m_userData == 'leftShelf' || contactList0.next.contact.m_fixtureA.m_userData == 'leftShelf' || contactList0.next.contact.m_fixtureB.m_userData == 'leftShelf') && (contactList0.contact.m_fixtureA.m_userData == 'box1' ||contactList0.contact.m_fixtureB.m_userData == 'box1' || contactList0.next.contact.m_fixtureA.m_userData == 'box1' || contactList0.next.contact.m_fixtureB.m_userData == 'box1') ) {
                            console.log('so far so good with box 0!');
                            correctBoxes++;
                        }
                    }
                }
            }

            // check boxes 1 through 3
            if (i > 0 && i < boxArray.length-1) {
                var contactList = boxArray[i].m_body.m_contactList;
                console.log("contactList[", i, "]: ", contactList);
                // middle boxes should have two (and only two) contacts;
                // they should be the the box below and the one above
                if (contactList.contact && contactList.next) {
                    if (contactList.next.next == null) {
                        // now check to make sure one of the contacts is box below,
                        // and the other is box above
                        var boxBelow = 'box' + (i-1).toString();
                        var boxAbove = 'box' + (i+1).toString();
                        if ((contactList.contact.m_fixtureA.m_userData == boxBelow ||contactList.contact.m_fixtureB.m_userData == boxBelow || contactList.next.contact.m_fixtureA.m_userData == boxBelow || contactList.next.contact.m_fixtureB.m_userData == boxBelow) && (contactList.contact.m_fixtureA.m_userData == boxAbove ||contactList.contact.m_fixtureB.m_userData == boxAbove || contactList.next.contact.m_fixtureA.m_userData == boxAbove || contactList.next.contact.m_fixtureB.m_userData == boxAbove) ) {
                            console.log('so far so good with box ', i, '!');
                            correctBoxes++;
                        }
                    }
                }
            }

            // check box 5
            if (i == boxArray.length-1) {
                var contactList = boxArray[i].m_body.m_contactList;
                var boxBelow = 'box' + (i-1).toString();
                if (contactList.contact && contactList.next == null) {
                    if (contactList.contact.m_fixtureA.m_userData == boxBelow ||contactList.contact.m_fixtureB.m_userData == boxBelow) {
                            correctBoxes++;
                    }
                }

            }
        }
        if (correctBoxes == boxArray.length) {
            return true;
        } else {
            return false;
        }
    }

    /*****************************
    Animation loop
    *****************************/

    function update() {
        // determine when to create shelves
        // (when all boxes resting for the first time)
        if (!gameStarted) {
            var restingCount = 0;
            for (var i = 0; i < boxArray.length; i++) {
                if (!boxArray[i].m_body.IsAwake()) {
                    // console.log("isAwake for [", i, "]: ", boxArray[i].m_body.IsAwake());
                    restingCount++;
                }
            }

            if (restingCount == boxArray.length) {
                createShelves();
                gameStarted = true;
            }
        }

        // if all boxes resting, check to see if stacked correctly
        if (gameStarted && !checkRun) {
            var restingCount = 0;
            for (var i = 0; i < boxArray.length; i++) {
                if (!boxArray[i].m_body.IsAwake()) {
                    restingCount++;
                }
            }
            console.log("resting count: ", restingCount);
            if (restingCount == boxArray.length) {
                console.log("all at rest");
                checkRun = true;
                if (checkStackingOrder()) {
                    gameWon = true;
                }
            }
        }

        // add mousejoints when pick up a box 
        if (mouseIsDown && (!mouseJoint)) {
            var body = getBodyAtMouse();
            if(body) {
                var md = new b2MouseJointDef();
                md.bodyA = world.GetGroundBody();
                md.bodyB = body;
                md.target.Set(pixels(mouseX), pixels(mouseY));
                md.collideConnected = true;
                md.maxForce = 300 * body.GetMass();
                mouseJoint = world.CreateJoint(md);
                body.SetAwake(true);
            }
        }

        if (mouseJoint) {
            if(mouseIsDown) {
                mouseJoint.SetTarget(new b2Vec2(pixels(mouseX), pixels(mouseY)));
            } else {
                world.DestroyJoint(mouseJoint);
                mouseJoint = null;
            }
        }

        // stepping through the simulation
	    // parameters are time step, velocity iteration count, and position iteration count 
	    world.Step(1/60, 10, 10);
	    world.DrawDebugData();
	    world.ClearForces();

        // context.clearRect(0, 0, canvas.width, canvas.height);

        // draw test boxes, rotated appropropriately
        for (var i = 0; i < boxArray.length; i++) {
            // draw images
            context.save();
            var boxWidth = getBoxCoordinates(boxArray[i]).width;
            var boxHeight = getBoxCoordinates(boxArray[i]).height;
            var boxX = getBoxCoordinates(boxArray[i]).x + 0.5 * boxWidth;
            var boxY = getBoxCoordinates(boxArray[i]).y + 0.5 * boxHeight;
            context.translate(boxX, boxY);
            context.rotate(getBoxCoordinates(boxArray[i]).rotation);
            context.drawImage(imageArray[i], -0.5 * boxWidth, -0.5 * boxHeight, boxWidth, boxHeight);
            // context.drawImage(imageArray[i], 0, 0, boxWidth, boxHeight);
            context.restore();
        }

        if (gameWon) {
            context.fillStyle = 'black';
            context.lineWidth = 1;
            context.strokeText("You win!", canvas.width/2, canvas.height/2);            
        }
        if (!gameWon) {
            requestAnimFrame(update);
        }
    }

    // fire it all up with the first call
    requestAnimFrame(update);
}