/**
 * advanced:
 * make this work offline
 * https://developer.mozilla.org/en-US/docs/HTML/Using_the_application_cache
 * note: you must edit the manifest to update files
 *
 */



var posts = [];

/**
 * form action
 *
 */

$('#draft button').click( function(event){

    // stop form from trying to send & refresh page
    event.preventDefault();

    // create post from form
    var post = {};
    post.title = $('#title').val();
    post.content = $('#content').val();

    // add post to posts
    posts.push(post);

    console.log('post: ',post);
    console.log('posts: ',posts);

    displayPost(post);
    storePosts(posts);

});


/**
 * display posts
 *
 */

function displayPost( post, indexNumber ){
    
    var html = '<article id = \'article' + indexNumber + '\'><h2>'+ post.title +'</h2><p>'+ post.content +'</p></article>';
    console.log(html);
    $('#feed').prepend(html);
    
}


/**
 * store posts
 *
 * note: localStorage only stores STRINGS
 *          arrays/objects must be STRINGIFIED
 *          numbers are fine but will be returned as a string
 *
 */

function storePosts(posts){

    console.log('array: ' + posts);

    // make the array a string
    posts = JSON.stringify(posts);
    console.log('json: ' + posts);

    // store the string
    localStorage.posts = posts;

}


/**
 * localStorage = STRINGS only!!
 *
 * note: localStorage only stores STRINGS
 *  - arrays/objects must be STRINGIFIED before storage, PARSED after retrieval. 
 *  - numbers also: 
 *       var num = localStorage.mynumber;   // '10.123' 
 *           num = parseFloat(num);         // 10.123 
 *           num = parseInt(num);           // 10
 *
 */


/**
 * load posts
 *
 * note: localStorage only stores STRINGS
 *          arrays/objects must be PARSED
 *          numbers also: var num = parseInt(); 
 *
 */

function loadPosts(){

    // check for posts in storage
    if (localStorage.posts) { 

        posts = localStorage.posts;

        // turn string into an array
        posts = JSON.parse(posts);

        // loop thru items in the array
        for( i=0, count=posts.length; i<count; i++ ){

            var post = posts[i]
            console.log( post );
            displayPost(post, i);
        }
        // add click listener to each article
        $('article').click(function () {
            // toggle the class being clicked
            $(this).toggleClass("active");
            console.log(this.id); // this works

            // if other class is active, toggle that off of active
            for (i=0, count=posts.length; i<count; i++) {
                // console.log ("getting id: " + document.getElementById("article" + i).id);
                var currentObject = document.getElementById("article" + i);
                console.log("currentObject: " + currentObject);
                if ($(this).attr('id') != $(currentObject).attr('id')) {
                    if ($(currentObject).attr('class') == "active") {
                        $(currentObject).toggleClass("active");
                    }
                }

                // if (posts[i].id != this.id && posts[i].class == "active") {
                //     $(posts[i]).toggleClass("active");
                // }
            }
        });
    } else { // nothing in storage?
    
        posts = []; 
    
    }

}

// load posts on page load
loadPosts();


/**
 * advanced
 * alternative way to organize your code
 * not currently in use
 */

var app = {
    load : function(){
        if (localStorage.posts) { 
            posts = localStorage.posts;
            posts = JSON.parse(posts);
            for( i=0, count=posts.length; i<count; i++ ){
                var post = posts[i]
                displayPost(post);
            }
        }        
    },
    store : function(posts){
        posts = JSON.stringify(posts);
        localStorage.posts = posts;
    }
}

// app.load();
// app.store(posts);
