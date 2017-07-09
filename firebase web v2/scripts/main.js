'use strict';

// Shortcuts to DOM Elements.
var messageForm = document.getElementById('message-form');
var messageInput = document.getElementById('new-post-message');
var titleInput = document.getElementById('new-post-title');
var signInButton = document.getElementById('sign-in-button');
//var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var addPost = document.getElementById('add-post');
var addButton = document.getElementById('add');
var recentPostsSection = document.getElementById('recent-posts-list');
var userPostsSection = document.getElementById('user-posts-list');
var topUserPostsSection = document.getElementById('top-user-posts-list');
var recentMenuButton = document.getElementById('menu-recent');
var myPostsMenuButton = document.getElementById('menu-my-posts');
var myTopPostsMenuButton = document.getElementById('menu-my-top-posts');
var listeningFirebaseRefs = [];

/**
 * Saves a new post to the Firebase DB.
 */
// [START write_fan_out]
function writeNewPost(uid, username, picture, title, body) {
    // A post entry.
    var postData = {
        author: username,
        uid: uid,
        body: body,
        title: title,
        starCount: 0,
        authorPic: picture
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('tr/recipes').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/tr/recipes/' + newPostKey] = postData;
    updates['/user-posts/' + uid + '/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
}
// [END write_fan_out]

/**
 * Star/unstar post.
 */
// [START post_stars_transaction]
function toggleStar(postRef, uid) {
    postRef.transaction(function (post) {
        if (post) {
            if (post.stars && post.stars[uid]) {
                post.starCount--;
                post.stars[uid] = null;
            } else {
                post.starCount++;
                if (!post.stars) {
                    post.stars = {};
                }
                post.stars[uid] = true;
            }
        }
        return post;
    });
}
// [END post_stars_transaction]

/**
 * Creates a post element.
 */
function createPostElement(postId, title, time, ingredients, image, category, age, agePassive, type) {
    //////alert("creat");
    //alert(postId);
    var uid = firebase.auth().currentUser.uid;
    var body;

    var html =
        '<div class="post post-' + postId + ' mdl-cell mdl-cell--12-col ' +
                    'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
          '<div class="mdl-card mdl-shadow--2dp">' +
            '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
              '<h4 class="mdl-card__title-text"></h4>' +
              
            '</div>' +
              '<div class="mdl-card__title mdl-color--light-blue-200 mdl-color-text--white"  style="height:60px">' +
            '<h4 class="age"></h4>' +
            '</div>' +
            '<div class="header">' +
              '<div>' +
                '<div class="avatar"></div>' +
                '<div class="username mdl-color-text--black"></div>' +
              '</div>' +
            '</div>' +
            //'<span class="star" >' +
            //  '<div class="not-starred material-icons">star_border</div>' +
            //  '<div class="starred material-icons">star</div>' +
            //  '<div class="star-count">0</div>' +
            //'</span>' +
            '<div class="text"></div>' +

        '<div class="comments-container"></div>' +

    //'<div class="age"></div>' +
    '<div class="link"></div>' +
    '<form class="add-comment" action="#">' +
      '<div class="mdl-textfield mdl-js-textfield">' +
    //'<input class="mdl-textfield__input new-comment" type="text">' +
        '<label class="mdl-textfield__label"></label>' +
      '</div>' +
    '</form>' +
  '</div>' +
'</div>';
    //alert(html);
    // Create the DOM element from the HTML.
    var div = document.createElement('div');
    div.innerHTML = html;
    var postElement = div.firstChild;
    //if (componentHandler) {
    //  componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);
    //}

    var addCommentForm = postElement.getElementsByClassName('add-comment')[0];
    var commentInput = postElement.getElementsByClassName('new-comment')[0];
    var star = postElement.getElementsByClassName('starred')[0];
    var unStar = postElement.getElementsByClassName('not-starred')[0];
    var commentsRef = null;

    // Set values.
    //alert(ingredients.substring(0, 300));

    if (getUrlVars()["recipes"] == null && getUrlVars()["article"] == null && getUrlVars()["question"] == null) {
        //alert("ok");
        //if (ingredients.length < 300)
            ingredients = ingredients.substring(0, 300) +"..";
    }

    //alert(ingredients.length);
    postElement.getElementsByClassName('text')[0].innerText = ingredients;

    postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
    //postElement.getElementsByClassName('comments-container')[0].innerText = "Kategori: " + category;

    if (agePassive)
        postElement.getElementsByClassName('age')[0].innerText = "Yaş: " + age + " AY";

    if (type == "recipes") {
        //postElement.getElementsByClassName('link')[0].innerHTML = "Link: " + "<a target='_blank' href='https://bebekklubu.com/index.html?recipes=" + postId + "'> https://bebekklubu.com/index.html?recipes=" + postId + "</a>";
        postElement.getElementsByClassName('link')[0].innerHTML = "<a href='https://bebekklubu.com/index.html?recipes=" + postId + "' target='_blank'>  <img src='https://bebekklubu.com/pics/link.png' alt='Tamamını görüntüle' style='width:22px;height:22px;border:0;'> </a>";
        commentsRef = firebase.database().ref('tr/comments/' + postId);
        //document.title = title;
    }
    if (type == "article") {
        //postElement.getElementsByClassName('link')[0].innerHTML = "Link: " + "<a target='_blank' href='https://bebekklubu.com/index.html?article=" + postId + "'> https://bebekklubu.com/index.html?article=" + postId + "</a>";
        postElement.getElementsByClassName('link')[0].innerHTML = "<a href='https://bebekklubu.com/index.html?article=" + postId + "' target='_blank'>  <img src='https://bebekklubu.com/pics/link.png' alt='Tamamını görüntüle' style='width:22px;height:22px;border:0;'> </a>";
        commentsRef = firebase.database().ref('tr/comments/' + postId);
        //document.title = title;
    } if (type == "question") {
        //postElement.getElementsByClassName('link')[0].innerHTML = "Link: " + "<a target='_blank' href='https://bebekklubu.com/index.html?question=" + postId + "'> https://bebekklubu.com/index.html?question=" + postId + "</a>";
        postElement.getElementsByClassName('link')[0].innerHTML = "<a href='https://bebekklubu.com/index.html?question=" + postId + "' target='_blank'>  <img src='https://bebekklubu.com/pics/link.png' alt='Tamamını görüntüle' style='width:22px;height:22px;border:0;'> </a>";
        commentsRef = firebase.database().ref('chatboardcomments/' + postId);
        //document.title = title;
    }



    postElement.getElementsByClassName('username')[0].innerText = category;
    postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
        (image || './silhouette.jpg') + '")';

    if (getUrlVars()["recipes"] != null || getUrlVars()["article"] != null || getUrlVars()["question"] != null) {

        // Listen for comments.
        // [START child_event_listener_recycler]

        commentsRef.on('child_added', function (data) {
            addCommentElement(postElement, data.key, data.val().message, data.val().user);
        });

        commentsRef.on('child_changed', function (data) {
            setCommentValues(postElement, data.key, data.val().message, data.val().user);
        });

        commentsRef.on('child_removed', function (data) {
            deleteComment(postElement, data.key);
        });
    }
    // [END child_event_listener_recycler]

    // Listen for likes counts.
    // [START post_value_event_listener]
    //var starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
    //starCountRef.on('value', function(snapshot) {
    //  updateStarCount(postElement, snapshot.val());
    //});
    // [END post_value_event_listener]

    // Listen for the starred status.
    var starredStatusRef = firebase.database().ref('posts/' + postId + '/stars/' + uid)
    starredStatusRef.on('value', function (snapshot) {
        //updateStarredByCurrentUser(postElement, snapshot.val());
    });

    // Keep track of all Firebase reference on which we are listening.
    //listeningFirebaseRefs.push(commentsRef);
    //listeningFirebaseRefs.push(starCountRef);
    //listeningFirebaseRefs.push(starredStatusRef);

    // Create new comment.
    //addCommentForm.onsubmit = function(e) {
    //  e.preventDefault();
    //  createNewComment(postId, firebase.auth().currentUser.displayName, uid, commentInput.value);
    //  commentInput.value = '';
    //  commentInput.parentElement.MaterialTextfield.boundUpdateClassesHandler();
    //};

    // Bind starring action.
    var onStarClicked = function () {
        alert("start");
        var globalPostRef = firebase.database().ref('/tr/recipes/' + postId);
        var userPostRef = firebase.database().ref('/user-posts/' + authorId + '/' + postId);
        toggleStar(globalPostRef, uid);
        toggleStar(userPostRef, uid);
    };
    //unStar.onclick = onStarClicked;
    //star.onclick = onStarClicked;

    return postElement;
}

/**
 * Writes a new comment for the given post.
 */
function createNewComment(postId, username, uid, text) {
    firebase.database().ref('post-comments/' + postId).push({
        text: text,
        author: username,
        uid: uid
    });
}

/**
 * Updates the starred status of the post.
 */
/*
function updateStarredByCurrentUser(postElement, starred) {
  if (starred) {
    postElement.getElementsByClassName('starred')[0].style.display = 'inline-block';
    postElement.getElementsByClassName('not-starred')[0].style.display = 'none';
  } else {
    postElement.getElementsByClassName('starred')[0].style.display = 'none';
    postElement.getElementsByClassName('not-starred')[0].style.display = 'inline-block';
  }
}
*/
/**
 * Updates the number of stars displayed for a post.
 */
//function updateStarCount(postElement, nbStart) {
//  postElement.getElementsByClassName('star-count')[0].innerText = nbStart;
//}

/**
 * Creates a comment element and adds it to the given postElement.
 */
function addCommentElement(postElement, id, message, user) {
    var comment = document.createElement('div');
    comment.classList.add('comment-' + id);
    comment.innerHTML = '<span class="username"></span><span class="comment"></span>';
    comment.getElementsByClassName('comment')[0].innerText = message;
    comment.getElementsByClassName('username')[0].innerText = user || 'Anonymous';

    var commentsContainer = postElement.getElementsByClassName('comments-container')[0];
    commentsContainer.appendChild(comment);
}

/**
 * Sets the comment's values in the given postElement.
 */
function setCommentValues(postElement, id, message, user) {
    var comment = postElement.getElementsByClassName('comment-' + id)[0];
    comment.getElementsByClassName('comment')[0].innerText = message;
    comment.getElementsByClassName('fp-username')[0].innerText = user;
}

/**
 * Deletes the comment of the given ID in the given postElement.
 */
function deleteComment(postElement, id) {
    var comment = postElement.getElementsByClassName('comment-' + id)[0];
    comment.parentElement.removeChild(comment);
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

/**
 * Starts listening for new posts and populates posts lists.
 */

function startDatabaseQueries() {
    // [START my_top_posts_query]
    var myUserId = firebase.auth().currentUser.uid;
    //var topUserPostsRef = firebase.database().ref('user-posts/' + myUserId).orderByChild('starCount');
    // [END my_top_posts_query]
    // [START recent_posts_query]

    // [END recent_posts_query]
    //var userPostsRef = firebase.database().ref('users/' + myUserId);
    var parmRecipes;

    parmRecipes = getUrlVars()["recipes"];

    if (parmRecipes != null) {
        var recentPostsRef = firebase.database().ref('tr/recipes/').orderByKey().equalTo(parmRecipes);
        recentMenuButton.click();

    }
    else {
        var recentPostsRef = firebase.database().ref('tr/recipes');//.limitToLast(10);
    }

    //alert(getUrlVars()["id"]);

    var fetchPosts = function (postsRef, sectionElement) {
        postsRef.on('child_added', function (data) {
            //var author = data.val().author || 'Anonymous';
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            //alert(containerElement);
            //if (data.val().title != "") {
            containerElement.insertBefore(
                createPostElement(data.key, data.val().title, data.val().time, data.val().ingredients, data.val().image, data.val().category, data.val().age, true, "recipes"),
            containerElement.firstChild);

            if (parmRecipes != null)
                document.title = data.val().title;
            // }
        });
        postsRef.on('child_changed', function (data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
            postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
            postElement.getElementsByClassName('username')[0].innerText = data.val().age;
            postElement.getElementsByClassName('text')[0].innerText = data.val().ingredients;
            postElement.getElementsByClassName('star-count')[0].innerText = data.val().age;
        });
        postsRef.on('child_removed', function (data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var post = containerElement.getElementsByClassName('post-' + data.key)[0];
            post.parentElement.removeChild(post);
        });
    };

    // Fetching and displaying all posts of each sections.
    //fetchPosts(topUserPostsRef, topUserPostsSection);
    fetchPosts(recentPostsRef, recentPostsSection);
    //fetchPosts(userPostsRef, userPostsSection);

    // Keep track of all Firebase refs we are listening to.
    //listeningFirebaseRefs.push(topUserPostsRef);
    listeningFirebaseRefs.push(recentPostsRef);
    //listeningFirebaseRefs.push(userPostsRef);
}

function startDatabaseQueriesArticle() {
    //alert("ok");
    // [START my_top_posts_query]
    var myUserId = firebase.auth().currentUser.uid;
    //var topUserPostsRef = firebase.database().ref('user-posts/' + myUserId).orderByChild('starCount');
    // [END my_top_posts_query]
    // [START recent_posts_query]
    //var recentPostsRef = firebase.database().ref('tr/recipes').limitToLast(10);
    // [END recent_posts_query]


    var parmArticle;

    parmArticle = getUrlVars()["article"];

    if (parmArticle != null) {
        var userPostsRef = firebase.database().ref('tr/forumcontents').orderByKey().equalTo(parmArticle);
        //document.title = userPostsRef.title;
        myPostsMenuButton.click();
    }
    else {
        var userPostsRef = firebase.database().ref('tr/forumcontents');
    }


    var fetchPostsArticle = function (postsRef, sectionElement) {
        postsRef.on('child_added', function (data) {
            //var author = data.val().author || 'Anonymous';
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            //alert(containerElement);
            //if (data.val().title != "") {
            containerElement.insertBefore(
                createPostElement(data.key, data.val().title, data.val().time, data.val().content, data.val().image, data.val().category, data.val().age, false, "article"),
            containerElement.firstChild);

            if (parmArticle != null)
                document.title = data.val().title;
            // }
        });
        postsRef.on('child_changed', function (data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
            postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
            postElement.getElementsByClassName('username')[0].innerText = data.val().age;
            postElement.getElementsByClassName('text')[0].innerText = data.val().content;
            postElement.getElementsByClassName('star-count')[0].innerText = data.val().age;
        });
        postsRef.on('child_removed', function (data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var post = containerElement.getElementsByClassName('post-' + data.key)[0];
            post.parentElement.removeChild(post);
        });
    };

    // Fetching and displaying all posts of each sections.
    //fetchPosts(topUserPostsRef, topUserPostsSection);
    //fetchPosts(recentPostsRef, recentPostsSection);
    fetchPostsArticle(userPostsRef, userPostsSection);

    // Keep track of all Firebase refs we are listening to.
    //listeningFirebaseRefs.push(topUserPostsRef);
    //listeningFirebaseRefs.push(recentPostsRef);
    listeningFirebaseRefs.push(userPostsRef);
}

function startDatabaseQueriesQuestion() {
    //alert("ok");
    // [START my_top_posts_query]
    var myUserId = firebase.auth().currentUser.uid;
    //var topUserPostsRef = firebase.database().ref('user-posts/' + myUserId).orderByChild('starCount');
    // [END my_top_posts_query]
    // [START recent_posts_query]
    //var recentPostsRef = firebase.database().ref('tr/recipes').limitToLast(10);
    // [END recent_posts_query]


    var parmQuestion;

    parmQuestion = getUrlVars()["question"];

    if (parmQuestion != null) {
        var topUserPostsRef = firebase.database().ref('chatboardcontents').orderByKey().equalTo(parmQuestion);//.orderByChild("lang").equalTo("tr");
        //document.title = topUserPostsRef.title;
        myTopPostsMenuButton.click();
    }
    else {
        var topUserPostsRef = firebase.database().ref('chatboardcontents').orderByChild("lang").equalTo("tr");
    }


    var fetchPostsQuestion = function (postsRef, sectionElement) {
        postsRef.on('child_added', function (data) {
            //var author = data.val().author || 'Anonymous';
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            //alert(containerElement);
            //if (data.val().title != "") {
            containerElement.insertBefore(
                createPostElement(data.key, data.val().title, data.val().date, data.val().content, data.val().image, data.val().publisher, data.val().lang, false, "question"),
            containerElement.firstChild);

            if (parmQuestion != null)
                document.title = data.val().title;
            // }
        });
        postsRef.on('child_changed', function (data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
            postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
            postElement.getElementsByClassName('username')[0].innerText = data.val().age;
            postElement.getElementsByClassName('text')[0].innerText = data.val().content;
            postElement.getElementsByClassName('star-count')[0].innerText = data.val().age;
        });
        postsRef.on('child_removed', function (data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var post = containerElement.getElementsByClassName('post-' + data.key)[0];
            post.parentElement.removeChild(post);
        });
    };

    // Fetching and displaying all posts of each sections.
    fetchPostsQuestion(topUserPostsRef, topUserPostsSection);
    //fetchPosts(recentPostsRef, recentPostsSection);
    //fetchPostsArticle(userPostsRef, userPostsSection);

    // Keep track of all Firebase refs we are listening to.
    listeningFirebaseRefs.push(topUserPostsRef);
    //listeningFirebaseRefs.push(recentPostsRef);
    //listeningFirebaseRefs.push(userPostsRef);
}

/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
    firebase.database().ref('users/' + userId).set({
        username: name,
        email: email,
        profile_picture: imageUrl
    });
}
// [END basic_write]

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
    // Remove all previously displayed posts.
    topUserPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
    recentPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
    userPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';

    // Stop all currently listening Firebase listeners.
    listeningFirebaseRefs.forEach(function (ref) {
        ref.off();
    });
    listeningFirebaseRefs = [];
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
    // We ignore token refresh events.
    if (user && currentUID === user.uid) {
        return;
    }

    cleanupUi();
    if (user) {
        currentUID = user.uid;
        splashPage.style.display = 'none';
        writeUserData(user.uid, user.displayName, user.email, user.photoURL);
        startDatabaseQueries();
        startDatabaseQueriesArticle();
        startDatabaseQueriesQuestion();

    } else {
        // Set currentUID to null.
        currentUID = null;
        // Display the splash page where you can sign-in.
        splashPage.style.display = '';
    }
}

/**
 * Creates a new post for the current user.
 */
function newPostForCurrentUser(title, text) {
    // [START single_value_read]
    var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
        var username = snapshot.val().username;
        // [START_EXCLUDE]
        return writeNewPost(firebase.auth().currentUser.uid, username,
            firebase.auth().currentUser.photoURL,
            title, text);
        // [END_EXCLUDE]
    });
    // [END single_value_read]
}

/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
    recentPostsSection.style.display = 'none';
    userPostsSection.style.display = 'none';
    topUserPostsSection.style.display = 'none';
    addPost.style.display = 'none';
    recentMenuButton.classList.remove('is-active');
    myPostsMenuButton.classList.remove('is-active');
    myTopPostsMenuButton.classList.remove('is-active');

    if (sectionElement) {
        sectionElement.style.display = 'block';
    }
    if (buttonElement) {
        buttonElement.classList.add('is-active');
    }
}





// Bindings on load.
window.addEventListener('load', function () {
    // Bind Sign in button.
    /*
  signInButton.addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
    */
    firebase.auth().signInWithEmailAndPassword("f.durakk@gmail.com", "321321321").catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        alert(errorCode + " " + errorMessage)
        // ...
    });
    // Bind Sign out button.
    //signOutButton.addEventListener('click', function () {
    //    firebase.auth().signOut();
    //});

    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(onAuthStateChanged);

    // Saves message on form submit.
    messageForm.onsubmit = function (e) {
        e.preventDefault();
        var text = messageInput.value;
        var title = titleInput.value;
        if (text && title) {
            newPostForCurrentUser(title, text).then(function () {
                myPostsMenuButton.click();
            });
            messageInput.value = '';
            titleInput.value = '';
        }
    };

    // Bind menu buttons.
    recentMenuButton.onclick = function () {
        showSection(recentPostsSection, recentMenuButton);
    };
    myPostsMenuButton.onclick = function () {
        showSection(userPostsSection, myPostsMenuButton);
    };
    myTopPostsMenuButton.onclick = function () {
        showSection(topUserPostsSection, myTopPostsMenuButton);
    };
    addButton.onclick = function () {
        showSection(addPost);
        messageInput.value = '';
        titleInput.value = '';
    };
    recentMenuButton.onclick();
}, false);
