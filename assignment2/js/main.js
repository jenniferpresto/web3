/************
Global variables
*************/
var currentTitleNumber = 3; // starts at whatever the latest story is
var currentTitleText;
var currentTitleImage;
var allTitles = []; // will hold all story titles

// for CartoDB ---------------
var cartodb_accountname = 'sandlappernyc';
var cartoUrl = 'http://sandlappernyc.cartodb.com/api/v2/sql?q=';
var carto_api_key = '&api_key=b3c3e1286652256b3974e4e06e7c6811f5f16101';
var table_name = 'narrativetable';
var title_table_name = 'titletable';
var cartoCommand;


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

	$('input, textarea').val('');

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
Click event for list of titles
*************/

function addClickToTitles () {
	// var allTitles = document.getElementsByClassName('storyTitle');
	// for (var i=0; i < allTitles.length; i++) {
	// 	allTitles[i].addEventListener("click", function() {
	// 		console.log("what is happening?");
	// 		var idStr = allTitles[i].id;
	// 		console.log("id: " + idStr);
	// 	})
	// }
	// $('.storyTitle').click (function() {
	//     var testHtml = $(this).attr("html");
	//     console.log("test html: ", testHtml);
	// 	var idStr = $(this).attr("id");
	// 	console.log("id of element: ", idStr);
	// })
}

/************
Querying cartodb for all story titles

This works for querying just one title:
SELECT * FROM titletable WHERE (titlenumber = 1)
*************/

function queryStoryTitles () {
	// var sqlTitleQuery = "SELECT * FROM " + title_table_name + " WHERE (titlenumber = " + currentTitle + ")";
	var sqlTitleQuery = "SELECT * FROM " + title_table_name;
	cartoCommand = cartoUrl + sqlTitleQuery + carto_api_key;
	var allTitles = [];
	var templateTitles = $('#titleListAll li.template'); // template in HTML
	var numTitles;

	$.getJSON(cartoCommand, function(titleData) {
		console.log("titleData", titleData);
		numTitles = titleData.rows.length;
		for (var i = 0; i < numTitles; i++) {
			// create line for each entry
			var template = templateTitles.clone();
			template.removeClass('template');
			template.addClass('titleList');
			template.find('.storyTitle').html(titleData.rows[i].title);
			template.attr('id', 'title' + titleData.rows[i].titlenumber);
			if (titleData.rows[i].inprogress) {
				template.find('.progress').html('<i>story in progress</i>');
			}

			// save title text to global variable
			if (titleData.rows[i].titlenumber == currentTitleNumber) {
				currentTitleText = titleData.rows[i].title;
				currentTitleImage = titleData.rows[i].imageurl;
			}

			allTitles.push(template);
		}
	})
	.success(function() {
		// console.log("JSON success in getting title details");
		if (numTitles > 0) {
			$('#titleListAll ul').append(allTitles);
			$('#titleListAll ul').append("<section class='clearfix'></section>");
			// note: must put queryStoryDetails function here; was otherwise getting called too early
			queryStoryDetails(currentTitleNumber);
			addClickToTitles();
		} else {
			console.log('no titles yet');
		}
	})
	.error (function() {})
	.complete (function() {
	});
}

/************
Querying cartodb for story details

This works:
SELECT * FROM narrativetable WHERE (storytitle = 1) ORDER BY (created_at) ASC

*************/

function queryStoryDetails (titleNumber) {
	var sqlStoryQuery = "SELECT * FROM " + table_name + " WHERE (storytitle = " + titleNumber + ") ORDER BY (created_at) ASC"
	cartoCommand = cartoUrl + sqlStoryQuery + carto_api_key;

	var storyOutput = [];
	var templateA = $('.details li.template'); // template in HTML
	// console.log ("this is templateA: ", templateA);
	var query_count; // total returned

	// remove all lines from the story detail page (will put back with $.getJSON function)
	$('.priorDetail').remove();

	$.getJSON(cartoCommand, function(detailData) {
		query_count = detailData.rows.length;
		// console.log(detailData.rows);

		for (var i = 0, j = detailData.rows.length; i < j; i++) {
			var template = templateA.clone();
			template.removeClass('template');
			template.addClass('priorDetail');
			// var temp = template.find('.storyLine');
			// console.log("temp element: ", temp); // this seems right
			template.find('.storyLine').html(detailData.rows[i].narrativetext);
			template.find('.credit').html('<i> written by ' + detailData.rows[i].author + '</i>');

			storyOutput.push(template);
		}
	})
	.success(function() {
		// console.log('getJSON success for storydetails');
		if (query_count > 0) {
			$('.details ul').append(storyOutput);
			$('.details ul').append("<section class='clearfix'></section>");
		} else {
			console.log('that story is empty');
		}
	})
	.error(function() {
		console.log('getJSON error under queryStoryDetails; boo, hoo');
	})
	.complete(function() {});

	// assign title name and image for current story
	document.getElementById('currentStoryTitle').innerHTML = currentTitleText;
	document.getElementById('currentStoryImage').innerHTML = "<img src = '" + currentTitleImage + "' alt='story image'>";
	// document.getElementById('currentStoryImage').innerHTML = "testing, testing";
};

/************
Inserting row into cartodb table
*************/

/* this works:
INSERT INTO narrativetable (author, narrativetext) VALUES ( 'testAuthor', 'testing the text');

Example write from cartodb:
http://sandlappernyc.cartodb.com/api/v2/sql?q=INSERT INTO table_name (the_geom, observation) VALUES (ST_GeomFromText(’POINT(-71.2 42.5)’, 4326),'rare bird spotted')&api_key=b3c3e1286652256b3974e4e06e7c6811f5f16101

*/



function addStoryEntry (author, content) {
	var sqlStoryEntry = "INSERT INTO " + table_name + " (author, narrativetext, storytitle) VALUES ( '" + author + "', '" + content + "', '" + currentTitleNumber + "');"
	writeCommand = cartoUrl + sqlStoryEntry + carto_api_key;
	
	// console.log(sqlInsert);
	console.log(writeCommand);

	$.getJSON(writeCommand, function(data) {
		console.log(data);
	})
	.success(function(response) {
		console.log('table successfully updated');
		console.log(response);
		// refresh the page
		queryStoryDetails(currentTitleNumber);
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

			var imageUrl;

			// prioritize animated GIFs over other possibilities
			if (animatedGifs.length > 0) {
				var randomNumber = Math.floor(Math.random() * animatedGifs.length);
				imageUrl = animatedGifs[randomNumber];
			} else {
				randomNumber = Math.floor(Math.random() * stillImages.length);
				imageUrl = stillImages[randomNumber];
			}			
			console.log("and the magic URL is... " + imageUrl);
		}
	})
}



/*********************************************
Calling certain functions right away
*********************************************/

queryStoryTitles();
