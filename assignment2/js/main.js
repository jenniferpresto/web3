/************
Global variables
*************/
var largestTitleNumber = 0; // this will be set each time queryStoryTitles is run
var currentTitleNumber = 1; // starts at arbitrary number for now
var currentTitleText;
var currentTitleImage;
var allTitles = []; // will hold all story titles
var titlesArray = []; // holds metrics about titles
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
Click event to refresh stories when click "All Stories" tab
*************/

$('#allNav').click (function (event) {
	event.preventDefault(event);
	queryStoryTitles();
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

	// clean up single quotes to ready for SQL input
	// (double quotes are generally ok as-is, unless the person goes crazy)
	author = author.replace("\'", "\'\'");
	content = content.replace("\'", "\'\'");
	// clean up ampersands
	author = author.replace("&", "%26");
	content = content.replace("&", "%26");
	// use uri encoding for question marks to avoid multiple question marks
	author = author.replace("?", "%3F");
	content = content.replace("?", "%3F");

	// replace returns with html "<br>"
	content = content.replace(/\r?\n/g, '<br>');

	console.log("author: ", author, " content: ", content);

	addStoryEntry(author, content);

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
	goingToNewStory = true;
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
	var templateTitles = $('#titleListAll li.template'); // template in HTML
	var numTitles;

	// remove all lines from the title list page (will put back with $.getJSON function)
	$('.titleList').remove();
	// empty the allTitles array (will be filled back up in $.getJSON function)
	allTitles.length = 0;

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
		getTitleMetrics(numTitles);
	})
	.error (function() {})
	.complete (function() {});
}

/************
Querying cartodb for story metrics for all stories

*************/

function getTitleMetrics(numTitles) {

	var sqlStoryQuery = "SELECT * FROM " + table_name + " ORDER BY (created_at) ASC"

	cartoCommand = cartoUrl + sqlStoryQuery + carto_api_key;

	var storyOutput = [];
	titlesArray.length = 0;

	// create objects on the fly to push into titlesArray 
	for ( var i = 0; i < numTitles; i++ ) {
		titleObj={
			number: i+1,
			count: 0,
			updated: "0000000000000",
			allMetrics: " ",
			inProgress: false
		};

		titlesArray.push(titleObj);
	}

	$.getJSON(cartoCommand, function(detailData) {
		var allStories = [];
		allStories = detailData.rows;

		for ( var i = 0, j = detailData.rows.length; i < j; i++ ) {
			var titleNum = allStories[i].storytitle;
			console.log("story title: ", allStories[i].storytitle);

			// count how many lines of the story there are
			titlesArray[titleNum-1].count++;			
			// get the latest date
			// var date = Date.parse(allStories[i].created_at);
			// console.log(date);

			if(allStories[i].created_at > titlesArray[titleNum-1].updated) {
				titlesArray[titleNum - 1].updated = allStories[i].created_at;
			}
		}

		// turn the date into a more readable, less ugly format
		for ( var i = 0; i < numTitles; i++ ) {
			var d = Date.parse(titlesArray[i].updated);
			var readable = new Date(d);
			var day = readable.getDay();
			switch (day) {
				case 0:
				day = "Sunday";
				break;
				case 1:
				day = "Monday";
				break;
				case 2:
				day = "Tuesday";
				break;
				case 3:
				day = "Wednesday";
				break;
				case 4:
				day = "Thursday";
				break;
				case 5:
				day = "Friday";
				break;
				case 6:
				day = "Saturday";
				break;
			}
			var month = readable.getMonth();
			switch (month) {
				case 0:
				month = "January";
				break;
				case 1:
				month = "February";
				break;
				case 2:
				month = "March";
				break;
				case 3:
				month = "April";
				break;
				case 4:
				month = "May";
				break;
				case 5:
				month = "June";
				break;
				case 6:
				month = "July";
				break;
				case 7:
				month = "August";
				break;
				case 8:
				month = "September";
				break;
				case 9:
				month = "October";
				break;
				case 10:
				month = "November";
				break;
				case 11:
				month = "December";
				break;
			}
			var date = readable.getDate();
			var year = readable.getFullYear();
			var time = readable.toLocaleTimeString();

			if (titlesArray[i].count > 14) {
				titlesArray[i].inProgress = false;
			} else {
				titlesArray[i].inProgress = true;
			}

			if (titlesArray[i].updated == '0000000000000') {
				titlesArray[i].allMetrics = 'no entries yet<br><br><div class="inProgress">story currently in progress</div>';
			} else {
				var dateString = 'last updated ' + month + ' ' + date + ', ' + year + '  ' + time;
				if (titlesArray[i].count == 1) {
					titlesArray[i].allMetrics = "1 entry<br>" + dateString + '<br><br><div class="inProgress">story currently in progress</div>';
				} else {
					if (titlesArray[i].inProgress) {
						titlesArray[i].allMetrics = titlesArray[i].count + " entries<br>" + dateString + '<br><br><div class="inProgress">story currently in progress</div>';
					} else {
						titlesArray[i].allMetrics = titlesArray[i].count + " entries<br>" + dateString + '<br><br><div class="closed">this story is now closed,<br>but you can still read it</div>'
					}
				}
			}
		}
	})
	.success(function () {
		if (numTitles > 0) {
			// append array created in queryStoryTitles
			$('#titleListAll ul').append(allTitles);
			$('#titleListAll ul').append("<section class='clearfix'></section>");

			// add the metrics for each title under its name
			for (var i=0; i < numTitles; i++) {
				var idString = "li#title"+(i+1);
				var tmpTitle = $(idString).find('.storyMetrics').html(titlesArray[i].allMetrics);
				console.log(tmpTitle);
				console.log(titlesArray[i].allMetrics);
			}

			// note: must put queryStoryDetails function here; was otherwise getting called too early
			queryStoryDetails(currentTitleNumber);
			addClickToTitles();
		} else {
			console.log('no titles yet');
		}
	})
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

		// if the story's full, don't show the Add-To-Story container
		if (!titlesArray[currentTitleNumber-1].inProgress) {
			$('#addToStory').hide();
		} else {
			$('#addToStory').show();
		}

		// warn if it's the last entry
		if (titlesArray[currentTitleNumber-1].count == 14) {
			$('textarea').attr('placeholder', 'What happens next? This is the very last entry for this story! Make it good!');
		} else {
			$('textarea').attr('placeholder', 'What happens next?');
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
			goingToNewStory = false;
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
		$('input, textarea').val('');
	})
	.error(function () {
		console.log('Error');
		alert("Oops, something is a little troubling about what you just wrote. Ampersands? Multiple question marks? You've got to take it a little easy here.\n\nIf you want to be really nice, send Jennifer a message with the text that didn't work. But you can adjust it and try again. Thanks!");
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
// getTitleMetrics(6);