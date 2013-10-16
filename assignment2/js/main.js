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
var cartodo_key = '&api_key=b3c3e1286652256b3974e4e06e7c6811f5f16101';
var table_name = 'narrativetable';

/************
Inserting row into cartodb table
*************/

