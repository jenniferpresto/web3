/************
Global variables
*************/
var largestTitleNumber = 0; // this will be set each time queryStoryTitles is run
var currentTitleNumber = 7; // starts at arbitrary number for now
var currentTitleText;
var currentTitleImage;
var allTitles = []; // will hold all story titles
var goingToNewStory = false;

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

function goFromTitleToStoryPage () {
	$('nav #allNav').removeClass('active');
	$('nav #currentNav').addClass('active');
	document.body.scrollTop = document.documentElement.scrollTop = 0;
    $('.page').fadeOut();
    $('#current').delay(400).fadeIn();
    console.log("calling function goFromTitleToStoryPage");
}

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

	// query titles table to find out the largest titlenumber

	// run function
	// getRandomImage calls addNewTitle, which calls queryStoryTitles, which calls queryStoryDetails
	getRandomImage();

})

/************
Click event for list of titles
*************/

function addClickToTitles () {
	//----------------------------------
	// what's wrong with this javascript?

	// var allTitles = document.getElementsByClassName('titleList');
	// console.log("all titles object", allTitles);
	// for (var i=0; i < allTitles.length; i++) {
	// 	console.log("allTitles[" + i + "]: ", allTitles[i]);

	// 	allTitles[i].addEventListener("click", function() {
	// 		// attempting to get id so can set current story correctly
	// 		// not yet working
	// 		var idStr = allTitles[i].id;
	// 		alert(allTitles[i].id);
	// 		console.log("id: " + idStr);
	// 		goFromTitleToStoryPage();
	// 	})
	// }
	//----------------------------------

	$('.titleList').click (function() {
	    // var testHtml = $(this).attr("html");
	    // console.log("test html: ", testHtml);
		var idStr = $(this).attr("id");
		console.log("id of element: ", idStr);
		// extract number from id name
		currentTitleNumber = idStr.replace(/^\D+/g, '');
		console.log("currentTitleNumber: " + currentTitleNumber);
		goingToNewStory = true;
		queryStoryTitles();
	})
}

/************
Querying cartodb for all story titles

This works for querying just one title:
SELECT * FROM titletable WHERE (titlenumber = 1)
*************/

function queryStoryTitles () {
	// var sqlTitleQuery = "SELECT * FROM " + title_table_name + " WHERE (titlenumber = " + currentTitle + ")";
	var sqlTitleQuery = "SELECT * FROM " + title_table_name + " ORDER BY (titlenumber) ASC";
	cartoCommand = cartoUrl + sqlTitleQuery + carto_api_key;
	var allTitles = [];
	var templateTitles = $('#titleListAll li.template'); // template in HTML
	var numTitles;

	// remove all lines from the title list page (will put back with $.getJSON function)
	$('.titleList').remove();

	$.getJSON(cartoCommand, function(titleData) {
		numTitles = titleData.rows.length;
		for (var i = 0; i < numTitles; i++) {
			// create line for each entry
			var template = templateTitles.clone();
			template.removeClass('template');
			template.addClass('titleList');
			template.find('.storyTitle').html(titleData.rows[i].title);
			template.attr('id', 'title' + titleData.rows[i].titlenumber);
			template.find('.littleImage').html('<img src = "' + titleData.rows[i].imageurl + '" alt = "little picture" /> ');

			// save title text to global variable
			if (titleData.rows[i].titlenumber == currentTitleNumber) {
				currentTitleText = titleData.rows[i].title;
				currentTitleImage = titleData.rows[i].imageurl;
			}

			allTitles.push(template);

			// find largest titlenumber for global variable largestTitleNumber
			if (titleData.rows[i].titlenumber > largestTitleNumber) {
				largestTitleNumber = titleData.rows[i].titlenumber;
			}
		}
	})
	.success(function() {
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
	var query_count; // total returned

	// remove all lines from the story detail page (will put back with $.getJSON function)
	$('.priorDetail').remove();

	$.getJSON(cartoCommand, function(detailData) {
		query_count = detailData.rows.length;

		for (var i = 0, j = detailData.rows.length; i < j; i++) {
			var template = templateA.clone();
			template.removeClass('template');
			template.addClass('priorDetail');
			// var temp = template.find('.storyLine');
			template.find('.storyLine').html(detailData.rows[i].narrativetext);
			template.find('.credit').html('<i> written by ' + detailData.rows[i].author + '</i>');

			storyOutput.push(template);
		}
	})
	.success(function() {
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
	.complete(function() {
		// if we're going to a new story (that is, we've gotten here by clicking
		// on a story in the title list, then switch to the current story page
		// then turn the boolean off immediately
		// the commented-out code breaks the navigation
		if(goingToNewStory) {
			goFromTitleToStoryPage();
			// $(#allNav).removeClass('active');
			// $(#currentNav).addClass('active');
			// $('.page').fadeOut();
			// $('#current').delay(400).fadeIn();
			addingNewStory = false;
		}
	});

	// assign title name and image for current story
	document.getElementById('currentStoryTitle').innerHTML = currentTitleText;
	document.getElementById('currentStoryImage').innerHTML = "<img src = '" + currentTitleImage + "' alt='story image' id='currentImageMain'>";
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
	
	$.getJSON(writeCommand, function(data) {
		console.log(data);
	})
	.success(function(response) {
		// console.log('table successfully updated');
		// console.log(response);
		queryStoryDetails(currentTitleNumber);
	})
	.error(function () {
		console.log('Error');
	})
	.complete(function() { 
		console.log('complete');
	});
}

function addNewTitle () {
	var sqlNewTitle = "INSERT INTO " + title_table_name + " (imageurl, inprogress, title, titlenumber) VALUES ( '" + currentTitleImage + "', '" + true + "', 'Collective Story " + currentTitleNumber + "', '" + currentTitleNumber + "');"
	writeCommand = cartoUrl + sqlNewTitle + carto_api_key;
	// actually send the command to cartodb
	$.getJSON(writeCommand, function(data) {
		console.log(data);
	})
	.success(function(response) {
		// console.log('table successfully updated');
		// console.log(response);
		// refresh the page
		addNewTitle = true;
		queryStoryTitles();
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
			// console.log(randomList);
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
			// console.log("and the magic URL is... " + imageUrl);
			currentTitleImage = imageUrl;
			currentTitleNumber = largestTitleNumber + 1; // setting new title
			addNewTitle();
		}
	})
}



/*********************************************
Kick things off by calling one function right away
*********************************************/

queryStoryTitles();