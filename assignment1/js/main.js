/* where are we in the story?*/
var page = 1;

// get both choice boxes
var choices = document.getElementById("choiceBox").getElementsByTagName("section");
// assign first one value of one; second one value of two
for (var i = 0; i < choices.length; i++) {
	choices[i].value = i + 1;
	choices[i].addEventListener('click', function() {
		turnPage(page, this.value);
		displayPage();
	});
}

console.log("choices: ", choices);

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

	else if (pageNumber == 14) {
		if (choiceValue == 1) {
			page = 20;
		}
		if (choiceValue == 2) {
			page = 20;
		}
	}

	// skip pages 18, 19, and 20; all endings
	console.log("New page: " + page);
}