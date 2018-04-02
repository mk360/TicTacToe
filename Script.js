var current = {
	player: "",
	symbol: ""
};
var symbols = ["X", "O"];
var grid = [
	"_", "_", "_", 
	"_", "_", "_", 
	"_", "_", "_"
];
var isClicked = {};
var players = {};
var fillCount = 0;
var gameOver = false;
sessionStorage.scores = {};

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      var len = o.length >>> 0;
      if (len === 0) {
        return false;
      }
      var n = fromIndex | 0;
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      while (k < len) {
        if (o[k] === searchElement) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}

function startGame() {
	var validNames = validateNames();
	var grid = new Grid();
	if (validNames) {
		grid.setup();
		setName(1);
		setName(2);
		document.getElementById("start").parentNode.removeChild(document.getElementById("start"));
	} else {
		alert("Please verify the players' names. Only un-spaced letters are allowed.");
		return false;
	}
}

function isValid(name) {
	return name && name.match(/\W/g) === null;
}

function validateNames() {
	var name1 = document.getElementById("name1").value;
	var name2 = document.getElementById("name2").value;
	return isValid(name1) && isValid(name2) && name1 !== name2;
}

function Grid() {

	this.setup = function() {
		var idNum = 0;
		var row1 = document.createElement("tr");
		var row2 = document.createElement("tr");
		var row3 = document.createElement("tr");
		var rows = [row1, row2, row3];
		var reference = this;
		for (i = 0; i < 3; i++) {
			for (j = 0; j < 3; j++) {
				var box = document.createElement("div");
				box.classList.add("box");
				box.id = idNum+1;
				box.innerHTML = "_"; // If we keep it blank, the box will shift downwards when the user inputs a value, and this until the whole row is filled
				box.onmouseenter = function() {
					this.style.backgroundColor = "#F86C84";
				};
				box.onmouseleave = function() {
					this.style.backgroundColor = "#f4dc42";
				};
				box.onclick = function() {
					reference.addMarking(this);
				};
				this.childNodes.push(box);
				var TD = document.createElement("td");
				TD.appendChild(box);
				rows[i].appendChild(TD);
				isClicked[idNum] = false;
				idNum++;
			}
		}
		document.getElementById("grid").style.border = "3px solid red";
		document.getElementById("grid").style.width = "230px";
		document.getElementById("grid").style.textAlign = "center";
		document.getElementById("grid").appendChild(row1);
		document.getElementById("grid").appendChild(row2);
		document.getElementById("grid").appendChild(row3);
		var name1 = document.getElementById("name1");
		var name2 = document.getElementById("name2");
		var name1_val = name1.value;
		var name2_val = name2.value;
		symbols.sort(function() { return 0.5 - Math.random(); });
		players[name1.value] = [symbols[0], name1];
		players[name2.value] = [symbols[1], name2];
		current.player = name1.value;
		current.span = players[current.player][1];
	};

	this.addMarking = function(box) {
		if (!isClicked[box.id]) {
			current.symbol = players[current.player][0];
			grid[box.id-1] = current.symbol;
			this.map();
			isClicked[box.id] = true;
			this.checkStatus();
			if (!gameOver) {
				switchTurns();
			}
		}
	};

	this.checkStatus = function() {
		var winningCombinations = [
		[1,2,3], [4,5,6], [7,8,9],
		[1,4,7], [2,5,8], [3,6,9],
		[1,5,9], [3,5,7]
		];
		var combinations = {
			X: registerPos(this.childNodes, "X"),
			O: registerPos(this.childNodes, "O")
		};
		var combs = combinations[current.symbol];
		for (i = 0; i < winningCombinations.length; i++) {
			var comb = winningCombinations[i];
			if (combs.includes(comb[0]) && combs.includes(comb[1]) && combs.includes(comb[2])) { // If the player aligned three winning spots
				combs = combs.filter(function(wantedSpot) {
					return comb.includes(wantedSpot); // So we don't show unwanted tiles
				});
				this.endGame("win", current.player, combs);
				gameOver = true;
				break;
			}
		}
		if (fillCount === 8 && !gameOver) { // If both players filled all boxes and we had no winner
			this.endGame("tie");
			gameOver = true;
		}
		fillCount++;
	};

	this.map = function() {
		var boxes = document.querySelectorAll("div.box");
		for (i = 0; i < 9; i++) { // We should always have 9 boxes
			boxes[i].innerHTML = grid[i];
		}
	};

	this.endGame = function(result, name, divs) {
		for (i = 0; i < 9; i++) {
			var shortcut = document.getElementById((i+1).toString());
			shortcut.onmouseenter = function(){};
			shortcut.onmouseleave = function(){};
			shortcut.onclick = function(){};
		}
		if (result === "win") {
			for (i = 0; i < 3; i++) {
				document.getElementById(divs[i].toString()).style.backgroundColor = "#42f468";
			}
			document.getElementById("result").innerHTML = "<center>" + name + " has won!</center>";
		} else {
			document.getElementById("result").innerHTML = "<center>It's a tie game!</center>";
		}
	};

	this.childNodes = [];
}

function setName(id) {
	var input = document.getElementById("name" + id);
	var val = input.value;
	input.parentNode.removeChild(input);
	var span = document.createElement("span");
	span.innerHTML = val + " " + format(players[val][0]);
	span.id = "span" + id;
	if (id === 1) {
		span.classList.add("left");
		span.classList.add("active");
		document.getElementById("start").parentNode.prepend(span);
	} else {
		span.classList.add("right");
		document.getElementById("start").parentNode.appendChild(span);
	}
	players[val][1] = span;
	// Transform the input fields into spans that contain the players names (or not really "transform", more appropriately "replace")
	// then refresh the players properties' values
}

function format(text) {
	if (text === "X") {
		return "<font style='color:#6050DC'>" + text + "</font>";
	}
	return "<font style='color:#DE2916'>" + text + "</font>";
}

function switchTurns() {
	var list = Object.keys(players);
	list.splice(list.indexOf(current.player), 1);
	var nextPlayer = list.toString();
	setCurrent(nextPlayer, current.player);
}

function setCurrent(nextPlayer, previousPlayer) {
	players[previousPlayer][1].classList.remove("active"); // Removing the active class from..........the active player
	current.player = nextPlayer;
	current.symbol = players[nextPlayer][0];
	current.span = players[nextPlayer][1];
	current.span.classList.add("active");
}

function registerPos(parent, target) {
	return parent.map(function(box) {
		if (box.innerHTML === target) {
			return Number(box.id);
		}
		return false;
	}).filter(function(filtered) {
		return filtered; // Take out the "undefined"
	});
}
