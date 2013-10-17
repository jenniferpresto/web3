/************
Page navigation
*************/

$('header nav').on('click', 'a', function(event){
    event.preventDefault(event);

    $('header nav a').removeClass('active');    
    $(this).toggleClass('active');
    
    var page = $(this).attr("href");
    $('.page').fadeOut();
    $(page).delay(400).fadeIn();

})

/************
Click event for addToStory button
*************/

$('#addToStory button').click (function (event) { // could be form#addToStory; space means something _within_ it (like in CSS)

	// stop form from sending/refreshing page
	event.preventDefault(event);

	// create variables from form
	var author = $('#author').val();
	var content = $('#content').val();

	addStoryEntry(author, content);
})

/************
Click event for newStory button
*************/

$('#newStory').click (function (event) { // could also say button#newStory

	// stop form from sending/refreshing page
	event.preventDefault(event);

	// run function
	getRandomImage();

})

/************
General variables for cartodb
*************/

var cartodb_accountname = 'sandlappernyc';
var writeUrl = 'http://sandlappernyc.cartodb.com/api/v2/sql?q=';
var carto_api_key = '&api_key=b3c3e1286652256b3974e4e06e7c6811f5f16101';
var table_name = 'narrativetable';
var cartoCommand;

/************
Querying cartodb for story details
*************/

/*
This works:
SELECT * FROM narrativetable WHERE (storytitle = 1) ORDER BY (created_at) ASC
*/

function queryStoryDetails (titleNumber) {
	var sqlStoryQuery = "SELECT * FROM " + table_name + " WHERE (storytitle = " + titleNumber + ") ORDER BY (created_at) ASC";
	cartoCommand = writeUrl + sqlStoryQuery + carto_api_key;

	var storyOutput = [];
	var templateA = $('.details li.template'); // template in HTML
	console.log ("this is templateA: ", templateA);
	var query_count; // total returned

	$.getJSON(cartoCommand, function(detailData) {
		query_count = detailData.rows.length;
		console.log(detailData.rows);

		// how would I use $.each for this and access the appropriate text for each one?
		// $.each(detailData.rows, function () {
		// 	var template = templateA.clone();
		// 	template.removeClass('template');
		// 	template.find('.storyLine').html([need to put stuff here]);
		// } )

		for (var i = 0, j = detailData.rows.length; i < j; i++) {
			var template = templateA.clone();
			template.removeClass('template');
			template.addClass('priorDetail');
			// var temp = template.find('.storyLine');
			// console.log("temp element: ", temp); // this seems right
			template.find('.storyLine').html(detailData.rows[i].narrativetext);
			template.find('.credit').html('<i> written by ' + detailData.rows[i].author + '</i><div class=\'floatbreak\' ></div>');

			storyOutput.push(template);
		}
		console.log("storyOutput length: " + storyOutput.length);
		console.log("storyOutput is this: ", storyOutput);
	})
	.success(function() {
		console.log('getJSON success for storydetails');
		if (query_count > 0) {
			$('.details ul').append(storyOutput);
			$('.details ul').append("<section class='clearfix'></section>")
		} else {
			console.log('that story is empty');
		}
	})
	.error(function() {
		console.log('getJSON error; boo, hoo');
	})
	.complete(function() {});
};

queryStoryDetails(2);

/************
Inserting row into cartodb table
*************/

/* this works:
INSERT INTO narrativetable (author, narrativetext) VALUES ( 'testAuthor', 'testing the text');

Example write from cartodb:
http://sandlappernyc.cartodb.com/api/v2/sql?q=INSERT INTO table_name (the_geom, observation) VALUES (ST_GeomFromText(’POINT(-71.2 42.5)’, 4326),'rare bird spotted')&api_key=b3c3e1286652256b3974e4e06e7c6811f5f16101

*/



function addStoryEntry (author, content) {
	var sqlStoryEntry = "INSERT INTO " + table_name + " (author, narrativetext) VALUES ( '" + author + "', '" + content + "');"
	writeCommand = writeUrl + sqlStoryEntry + carto_api_key;
	
	// console.log(sqlInsert);
	console.log(writeCommand);

	$.getJSON(writeCommand, function(data) {
		console.log(data);
	})
	.success(function(response) {
		console.log('table successfully updated');
		console.log(response);
	})
	.error(function () {
		console.log('Error');
	})
	.complete(function() { 
		console.log('complete');
	});
}


/************
Variables for imgur API
*************/

function getRandomImage () {
	$.ajax({
		url: 'https://api.imgur.com/3/gallery/random/random/',
		headers: {
			'Authorization': 'Client-ID 3194eb4c645950f'
		},
		type: 'GET',
		success: function(randomList) {
			console.log(randomList);
			var animatedCounter = 0; // just to keep track in a way that's easier to print to console
			var animatedGifs = [];
			var stillImages = [];
			for (var i = 0; i < randomList.data.length; i++) {
				// to prioritize animated GIFs, separate the two types
				// into two different arrays
				if (randomList.data[i].animated) {
					// save URL of animated GIF to its own array
					animatedGifs.push(randomList.data[i].link);
					// keep track of how many there are
					animatedCounter++; // can prolly get rid of later
				} else {
					stillImages.push(randomList.data[i].link);
				}
			}

			console.log("length of animatedGifs: " + animatedGifs.length);
			console.log("length of stillImages: " + stillImages.length);

			var imageUrl;

			// prioritize animated GIFs over other possibilities
			if (animatedGifs.length > 0) {
				var randomNumber = Math.floor(Math.random() * animatedGifs.length);
				console.log(randomNumber);
				imageUrl = animatedGifs[randomNumber];
			} else {
				randomNumber = Math.floor(Math.random() * stillImages.length);
				imageUrl = stillImages[randomNumber];
			}			
			console.log("and the magic URL is... " + imageUrl);
		}
	})
}