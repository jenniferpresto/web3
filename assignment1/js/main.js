/* where are we in the story?*/
var page = 0;
$('#story-canvas').hide();
$('#intro-canvas').show();

var introPicture = document.getElementById("intro-image");
var mainStory = document.getElementById("story");
var goBack = document.getElementById("goBack");

// start with a click on the main picture
introPicture.onclick = function() {
	page = 1;
	startStory();
	console.log("is this on?");
}

// add clickable way to go back to the beginning
goBack.onclick = function(){
	page = 1;
	displayPage(1);
}

// get both choice boxes
var choices = document.getElementById("choiceBox").getElementsByTagName("section");


// assign first one value of one; second one value of two
for (var i = 0; i < choices.length; i++) {
	choices[i].value = i + 1;

	// add an event listener so the boxes are clickable
	choices[i].addEventListener('click', function() {
		turnPage(page, this.value);
		displayPage(page);
	});
}

// ----------------------------------
// Begin Story Content:
// ----------------------------------

// create object to hold page content
function pageContent(story, choice1, choice2) {
	this.story = story;
	this.choice1 = choice1;
	this.choice2 = choice2;
}

// create the pages by making instances of that object (this will be lengthy)
var pages = new Array();

pages[0] = new pageContent(
	"It&rsquo;s been too long. You&rsquo;ve been meaning to go on a trip for a while, and you&rsquo;ve finally decided that the time is now. You&rsquo;ve arranged for time off at your job, and now you&rsquo;re standing in the travel section thumbing through the brightly colored books in Barnes & Noble. You&rsquo;re trying to decide what type of vacation you&rsquo;d like to take. On the one hand, you feel you could broaden your cultural horizons and see great architecture, steep yourself in history, and seek out transformative works of art. On the other, it might be nice to sit on a beach somewhere. You drum your fingers unconsciously, and a little loudly, on the bookshelf. Another customer shoots you an annoyed look.",
	"You decide to go to London.",
	"You decide to go to Pawley&rsquo;s Island, South Carolina."
	);

pages[1] = new pageContent(
	"After a perfectly pleasant direct flight, which included a surprisingly good meal at the beginning and a warm egg sandwich just before arrival, you arrive in London, England! What to do, what to do! How about checking out priceless artifacts from the annals of human history? But then again, you did just get off the flight, and it might be nice to take it easy the first day.",
	"You want to go to the British Museum.",
	"You want to head for the closest pub."
	);

pages[2] = new pageContent(
	"You can expand your mind on some other vacation.<br><br>A little haggard after the layover in Atlanta, which was supposed to have been three hours but wound up being six, you arrive in Myrtle Beach, South Carolina, where you rent a car and drive the short distance to Pawley&rsquo;s Island. There was no food on either flight, and you had to beg for a second glass of water, but now you&rsquo;re comfortably settled in the house you rented and you contemplate the day ahead. The choices seem boundless!",
	"You want to sit on the beach and stare at the ocean.",
	"You want to sit on the beach with a beer and stare at the ocean."
	);

pages[3] = new pageContent(
	"You walk into the British Museum. Artwork from ancient Egypt! Medieval paintings! The Elgin Marbles (take that, Greece!)! All for free! You bask in the culture, absorbing as much as you can.",
	"You want to keep absorbing culture and go to the Tower of London.",
	"You&rsquo;ve had enough and want to head for the closest pub."
	);

pages[4] = new pageContent(
	"The Tower of London, of course, is nowhere close to free. But the Beefeater tour makes it all worth it, and you learn about the bloody history of England&rsquo;s storied monarchy.",
	"You just can&rsquo;t get enough, and you want to go to the Tate Modern.",
	"You&rsquo;re ready to call it a day and head for the closest pub."
	);

pages[5] = new pageContent(
	"Beautiful works of modern art, also for free! Well, the Roy Lichtenstein retrospective is a special exhibition, and that&rsquo;s not free at all. Sure, you could just go to the Times Square subway station and see one of his works there any time, but it&rsquo;s better to see it in London. You enjoy yourself for a while, then try to decide what to do next.",
	"You want to visit Samuel Johnson&rsquo;s house.",
	"You&rsquo;ve seen enough for today and you want to head for the closest pub."
	);

pages[6] = new pageContent(
	"You learn about the man who compiled the famous Dictionary of the English Language, published in 1755. You learn about the sexual proclivities of his biographer, James Boswell. You watch a video, which appears to have been made around 1995, showing Johnson and Boswell conversing about Johnson&rsquo;s life. The video is worth the price of admission.",
	"You&rsquo;ve seen enough for today and you want to head for the closest pub.",
	"You&rsquo;re feeling thirsty."
	);

pages[7] = new pageContent(
	"Enough is enough! You can expand your mind further another day. You decide to pop into the Shakespeare&rsquo;s Head and order a pint of bitter at the bar. It&rsquo;s quiet, with just a few people scattered here and there throughout the dim pub. A man sits two seats down from you at the bar.",
	"You decide to strike up a conversation with the man.",
	"You prefer to drink in silence."
	);

pages[8] = new pageContent(
	"You take your umbrella and towel and a cooler of water bottles to the beach and stake out your spot. You focus on the horizon and let your mind begin to wander. A friendly looking couple strolls by. Their legs are covered with windblown sand, as though they&rsquo;d been walking for a bit, and you think they look a little thirsty.",
	"You speak up and offer them a couple of your water bottles.",
	"You wave politely and let them pass by."
	);

pages[9] = new pageContent(
	"You take your umbrella and towel and a cooler of beer to the beach and stake out your spot. You focus on the horizon and let your mind begin to wander. A friendly looking couple strolls by. Their legs are covered with windblown sand, as though they&rsquo;d been walking for a bit, and you think they look a little thirsty.",
	"You speak up and offer them a couple of your beer bottles.",
	"You wave politely and let them pass by."
	);

pages[10] = new pageContent(
	"&ldquo;Hey, thanks!&rdquo; says the man, as he gratefully takes the bottles.<br><br>&ldquo;We were really thirsty!&rdquo;<br><br>&ldquo;No problem,&rdquo; you respond. Pawley&rsquo;s always brings out your friendliest characteristics.<br><br>&ldquo;Listen,&rdquo; he says. &ldquo;This is sort of crazy, but we have actually something we can offer in return. Due to crazy scheduling, some last-minute travel changes, and our intense love of this idyllic place, we have a plane ticket to London that we&rsquo;re not going to use at all. It&rsquo;s fully transferable. Would you like to have it? We were going to go, but we decided that just staying on a beach would be better than trying to force ourselves to enjoy too much culture.&rdquo;",
	"You accept their ticket and go to London.",
	"You choose to stay at the beach."
	);

pages[11] = new pageContent(
	"You wave politely, and they cheerfully wave back. They slowly pass, and you watch them go by. Just as well: you didn&rsquo;t want any extra interaction. At the moment, you&rsquo;re content just to sit here on the beach, sipping from your bottle.<br><br>You stare at the horizon, and let your mind begin to wander.<br><br>THE END",
	" ",
	" "
	);

pages[12] = new pageContent(
	"You turn to the man. &ldquo;Hello!&rdquo; you say. He looks back at you, surprised. But he seems willing to chat, and you strike up a conversation. As time passes, he confides more and more, until he finally reveals that just earlier that day, he robbed a bank in a scheme so perfect that he can now take a break in a pub without fear of being caught. He seems to be offering you a position in his next heist.",
	"You turn him in to the police.",
	"You decide to hear more about his offer."
	);

pages[13] = new pageContent(
	"You leap off of the stool and rush to the front, screaming, &ldquo;Police! Police!&rdquo; A police officer stops, and you breathlessly explain to him what the man just told you. The policeman listens, nodding suspiciously. At the end of your tale, he forcefully grabs you, and handcuffs your hands behind your back before you realize what&rsquo;s happening. &ldquo;That robbery happened this morning, and there has been no press at all. Anyone with that much detail must have been involved,&rdquo; he explains to you. You look desperately back to the pub, but the man is gone.",
	"You&rsquo;re in handcuffs; you have no choice.",
	"You&rsquo;re in handcuffs; you have no choice."
	);

pages[14] = new pageContent(
	"&ldquo;Tell me more,&rdquo; you say. The rapport you&rsquo;ve managed to establish in such a short period is considerable. The man nods knowingly, leans in, and begins describing another perfect heist. You&rsquo;re amazed at the genius of it. You nod, memorize details, and agree to your role. Finally, in the early morning, you and he part ways, but with set tasks planned and an agreement to meet up again the following week. You start mentally preparing the letter of resignation to your job. This will have turned out to be a far more fruitful vacation than you had dared to hope.<br><br>THE END",
	" ",
	" "
	);

pages[15] = new pageContent(
	"You keep your head down and stare into your pint glass. Suddenly, there&rsquo;s a loud CRACK! behind you, and you realize that one patron has smashed a stool over another&rsquo;s back. Within an instant, a full-scale brawl breaks out, involving far more people than it originally appeared were even in the pub.",
	"You try to escape from the pub.",
	"You try to reason with the brawlers to talk them down."
	);

pages[16] = new pageContent(
	"Since the front of the pub is impassable, you fling your heavy glass at a window towards the back of the pub. It shatters through. You knock the glass out from around the edges with your travel book, and climb out. You fall onto the sidewalk, and realize you&rsquo;re staring right into a pair of shiny, official-looking boots. You look up at the policeman, who regards you with disdain. &ldquo;Stand up, and come with me.&rdquo; He gestures towards his car.",
	"You&rsquo;re kind of in a bind now, and you don&rsquo;t have a whole lot of choice.",
	"You&rsquo;re kind of in a bind now, and you don&rsquo;t have a whole lot of choice."
	);

pages[17] = new pageContent(
	"You put on your best calming, mediating expression, and throw yourself into the middle of the room, where you try to find the main instigators to talk sense into them. Alas, before you have a chance to speak at all, a barstool leg smashes into the back of your head and knocks you immediately unconscious. Luckily for you, and as we all know from the opening ceremony at the Olympics, England has a world-class public-health system. Which is very lucky for you, since you&rsquo;ll be needing it for the rest of your vacation.<br><br>THE END",
	" ",
	" "
	);

pages[18] = new pageContent(
	"&ldquo;That&rsquo;s a really generous offer, but I&rsquo;m fine staying here,&rdquo; you respond. &ldquo;I don&rsquo;t want to deal with too much culture on this vacation, either.&rdquo;<br><br>They smile and nod, kindred spirits. You chat for a while, and discover all sorts of common tastes. They invite you to meet them later that evening for dinner; you happily accept. A relaxing vacation, and possibly new friends!<br><br>&ldquo;See you later!&rdquo; the man says. They continue their walk down the beach.<br><br>You smile contentedly. Then you stare at the horizon, and let your mind begin to wander.<br><br>THE END",
	" ",
	" "
	);

pages[19] = new pageContent(
	"You start mentally preparing yourself for a lengthy battle with the UK criminal justice system.<br><br>THE END",
	" ",
	" "
	);

//------------------------------
// End Story Content
//------------------------------


// show the first page to start
displayPage(page);

function startStory() {
   $('#intro-canvas').hide();
   $('#story-canvas').show();
   page = 1;
	displayPage(1);
}

function displayPage(currentPage) {
	for (var i = 0; i < pages.length; i++) {
		if (i + 1 == currentPage) {
			mainStory.innerHTML = pages[i].story;
			/* following messes up formatting going forward
			if (pages[i].choice1 == pages[i].choice2) {
				choices[0].innerHTML = pages[i].choice1;
				choices[1].innerHTML = " ";
				// before do the following, need a way to undo it
				// choices[0].style.width = "99%";
				// choices[1].style.width = "0%"; 
			} else { */
			choices[0].innerHTML = pages[i].choice1;
			choices[1].innerHTML = pages[i].choice2;
			/*}*/
		}
	}
	console.log("on page: " + page);
}

// function to go to the right page
function turnPage(pageNumber, choiceValue) {
	if (pageNumber == 1) {
		if (choiceValue == 1) {
			page = 2;
		}
		if (choiceValue == 2) {
			page = 3;
		}
	}

	else if (pageNumber == 2) {
		if (choiceValue == 1) {
			page = 4;
		}
		if (choiceValue == 2) {
			page = 8;
		}
	}

	else if (pageNumber == 3) {
		if (choiceValue == 1) {
			page = 9;
		}
		if (choiceValue == 2) {
			page = 10;
		}
	}

	else if (pageNumber == 4) {
		if (choiceValue == 1) {
			page = 5;
		}
		if (choiceValue == 2) {
			page = 8;
		}
	}

	else if (pageNumber == 5) {
		if (choiceValue == 1) {
			page = 6;
		}
		if (choiceValue == 2) {
			page = 8;
		}
	}

	else if (pageNumber == 6) {
		if (choiceValue == 1) {
			page = 7;
		}
		if (choiceValue == 2) {
			page = 8;
		}
	}

	else if (pageNumber == 7) {
		if (choiceValue == 1) {
			page = 8;
		}
		if (choiceValue == 2) {
			page = 8;
		}
	}

	else if (pageNumber == 8) {
		if (choiceValue == 1) {
			page = 13;
		}
		if (choiceValue == 2) {
			page = 16;
		}
	}

	else if (pageNumber == 9) {
		if (choiceValue == 1) {
			page = 11;
		}
		if (choiceValue == 2) {
			page = 12;
		}
	}

	else if (pageNumber == 10) {
		if (choiceValue == 1) {
			page = 11;
		}
		if (choiceValue == 2) {
			page = 12;
		}
	}

	else if (pageNumber == 11) {
		if (choiceValue == 1) {
			page = 2;
		}
		if (choiceValue == 2) {
			page = 19;
		}
	}

	// skip page 12; that is an ending

	else if (pageNumber == 13) {
		if (choiceValue == 1) {
			page = 14;
		}
		if (choiceValue == 2) {
			page = 15;
		}
	}

	else if (pageNumber == 14) {
		if (choiceValue == 1) {
			page = 20;
		}
		if (choiceValue == 2) {
			page = 20;
		}
	}

	// skip page 15; that is an ending

	else if (pageNumber == 16) {
		if (choiceValue == 1) {
			page = 17;
		}
		if (choiceValue == 2) {
			page = 18;
		}
	}

	else if (pageNumber == 17) {
		if (choiceValue == 1) {
			page = 20;
		}
		if (choiceValue == 2) {
			page = 20;
		}
	}

	// skip pages 18, 19, and 20; all endings
}
