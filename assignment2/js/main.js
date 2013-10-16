/************
Page navigation
*************/

$('header nav').on('click', 'a', function(event){
    event.preventDefault(event);

    $('header nav a').removeClass('active');    
    $(this).toggleClass('active');
    
    var page = $(this).text();
    $('.page').fadeOut();
    $('#' + page).fadeIn();

})

/************
Variables for cartodb
*************/

var cartodb_accountname = 'sandlappernyc';
var writeUrl = 'http://sandlappernyc.cartodb.com/api/v2/sql?q=';
var carto_api_key = '&api_key=b3c3e1286652256b3974e4e06e7c6811f5f16101';
var table_name = 'narrativetable';

/************
Inserting row into cartodb table
*************/

/* this works:
INSERT INTO narrativetable (author, narrativetext) VALUES ( 'testAuthor', 'testing the text');

Example write from cartodb:
http://sandlappernyc.cartodb.com/api/v2/sql?q=INSERT INTO table_name (the_geom, observation) VALUES (ST_GeomFromText(’POINT(-71.2 42.5)’, 4326),'rare bird spotted')&api_key=b3c3e1286652256b3974e4e06e7c6811f5f16101

*/



function addStoryEntry (author, content) {
	var sqlInsert = "INSERT INTO " + table_name + " (author, narrativetext) VALUES ( '" + author + "', '" + content + "');"
	var writeCommand = writeUrl + sqlInsert + carto_api_key;
	
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
	getImage();

})

/************
Variables for imgur API:
Client ID: 3194eb4c645950f
Client secret: 85cd9f0ba88ebb4fd3cea72861fe1d928e86e751
*************/

function getImage () {
	$.ajax({
		url: 'https://api.imgur.com/3/gallery/random/random/',
		headers: {
			'Authorization': 'Client-ID 3194eb4c645950f'
		},
		type: 'GET',
		success: function(randomList) {
			// console.log (urlRequest.data.length);
			console.log(randomList);
		}
	})
}