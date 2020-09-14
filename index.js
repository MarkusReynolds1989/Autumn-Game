/* eslint-disable no-unused-vars */
"use strict";
// Global Constants.
const canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d");

// Globals variables.
let rightPressed = false,
	leftPressed = false,
	upPressed = false,
	downPressed = false,
	mouseReleased = false,
	mouseX,
	mouseY;

/***  Library functions ***/
const drawImage = (sprite, x, y) => ctx.drawImage(sprite, x, y);

const drawText = (text, x, y, size, color) => {
	ctx.fillStyle = color;
	ctx.font = `${size}pt mono`;
	ctx.fillText(text, x, y);
};

const drawRectangle = (x, y, width, height, color) => {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
};

const drawRectangeLines = (x, y, width, height, color) => {
	ctx.strokeStyle = color;
	ctx.strokeRect(x, y, width, height, color);
};

const drawLine = (startX, startY, endX, endY, color) => {
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
	ctx.endPath();
};

const clear = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawRectangle(0, 0, 800, 800, "#322947");
};

const keyDownHandler = (event) => {
	if (event.key == "Right" || event.key == "ArrowRight") {
		rightPressed = true;
		event.preventDefault();
	} else if (event.key == "Left" || event.key == "ArrowLeft") {
		leftPressed = true;
		event.preventDefault();
	} else if (event.key == "Up" || event.key == "ArrowUp") {
		upPressed = true;
		event.preventDefault();
	} else if (event.key == "Down" || event.key == "ArrowDown") {
		downPressed = true;
		event.preventDefault();
	}
};

const keyUpHandler = (event) => {
	if (event.key == "Right" || event.key == "ArrowRight") {
		rightPressed = false;
	} else if (event.key == "Left" || event.key == "ArrowLeft") {
		leftPressed = false;
	} else if (event.key == "Up" || event.key == "ArrowUp") {
		upPressed = false;
	} else if (event.key == "Down" || event.key == "ArrowDown") {
		downPressed = false;
	}
};

const mouseMoveHandler = (event) => {
	mouseX = event.pageX;
	mouseY = event.pageY;
};

const mouseClickHandler = () => {
	mouseReleased = true;
};

class Collision {
	static isRecTouching(item1, item2) {
		return (
			item1.x < item2.x + item2.dx &&
			item1.x + item1.dx > item2.x &&
			item1.y < item2.y + item2.dy &&
			item1.y + item1.dy > item2.y
		);
	}

	static isPointInRec(pointX, pointY, item2) {
		return (
			pointX >= item2.x &&
			pointX <= item2.x + 50 &&
			pointY >= item2.y &&
			pointY <= item2.y + 50
		);
	}
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("mouseup", mouseClickHandler, false);

/*** End Library  ***/

// Start Program
const pumpkin = new Image(),
	ghost = new Image(),
	seedBag = new Image(),
	dryDirt1 = new Image(),
	wetDirt1 = new Image(),
	seed = new Image(),
	tileState = {
		empty: "empty",
		hasSeed: "hasSeed",
		hasPumpkin: "hasPumpkin",
	};

let tiles = [],
	ghosts = [],
	pumpkins = 0,
	seeds = 1;

class Ghost {
	constructor(x, y, originX, originY) {
		this.x = x;
		this.y = y;
		this.originX = originX;
		this.originY = originY;
	}

	draw() {
		drawImage(ghost, this.x, this.y);
	}

	search() {
		let currentTile = tiles.find((x) => x.state == tileState.hasPumpkin);
		if (currentTile != undefined) {
			if (this.x < currentTile.x) {
				this.x += 0.5;
			}
			if (this.y < currentTile.y) {
				this.y += 0.5;
			}
			if (this.x > currentTile.x) {
				this.x -= 0.5;
			}
			if (this.y > currentTile.y) {
				this.y -= 0.5;
			}
			if (this.x == currentTile.x && this.y == currentTile.y) {
				currentTile.harvest();
			}
		} else {
			if (this.originX > 0 && this.originY > 0) {
				if (this.x < this.originX) {
					this.x += 1;
				}
				if (this.y < this.originY) {
					this.y += 1;
				}
			} else {
				if (this.x > this.originX) {
					this.x -= 1;
				}
				if (this.y > this.originY) {
					this.y -= 1;
				}
			}
		}
	}
}

class Tile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.isWatered = false;
		this.state = tileState.empty;
		this.growth = 0;
	}

	draw() {
		if (this.isWatered == false) {
			drawImage(dryDirt1, this.x, this.y);
		}
		if (this.isWatered == true) {
			drawImage(wetDirt1, this.x, this.y);
		}
		if (this.state == tileState.hasSeed) {
			drawImage(seed, this.x, this.y);
		}
		if (this.state == tileState.hasPumpkin) {
			drawImage(pumpkin, this.x + 10, this.y + 10);
		}
	}

	water() {
		this.isWatered = true;
	}

	plant() {
		this.isWatered = false;
		this.state = tileState.hasSeed;
	}

	grow() {
		if (this.isWatered == true && this.state == tileState.hasSeed) {
			this.growth += 0.25;
		}
		if (this.growth == 25) {
			this.isWatered = false;
		}
		if (this.growth == 50) {
			this.isWatered = false;
		}
		if (this.growth == 75) {
			this.isWatered = false;
		}
		if (this.growth >= 100) {
			this.state = tileState.hasPumpkin;
		}
	}

	harvest() {
		this.state = tileState.empty;
		this.isWatered = false;
		this.growth = 0;
	}
}

const init = () => {
	pumpkin.src = "Assets/Pumpkin1.png";
	seedBag.src = "Assets/SeedBag.png";
	dryDirt1.src = "Assets/DryDirt1.png";
	wetDirt1.src = "Assets/WetDirt1.png";
	ghost.src = "Assets/Ghost.png";
	seed.src = "Assets/Seed.png";
	for (let x = 50; x < 750; x += 50) {
		for (let y = 50; y < 750; y += 50) {
			tiles.push(new Tile(x, y));
		}
	}
	ghosts.push(new Ghost(-50, -50, -50, -50));
};

const drawScene = () => {
	clear(); // Run every frame.
	for (let tile of tiles) {
		tile.draw();

		if (Collision.isPointInRec(mouseX, mouseY, tile)) {
			drawRectangeLines(tile.x, tile.y, 50, 50, "#ffffeb");
		}
	}
	for (let ghost of ghosts) {
		ghost.draw();
	}

	drawText(`Seeds: ${seeds}`, 50, 785, 16, "#ffb570");
	drawImage(seedBag, 0, 750);
	drawText(`Pumpkins: ${pumpkins}`, 550, 785, 16, "#ffb570");
	drawImage(pumpkin, 500, 760);
};

const updateScene = () => {
	drawScene();
	// Handle tile state.
	if (mouseReleased) {
		let currentTile = tiles.find((x) =>
			Collision.isPointInRec(mouseX, mouseY, x)
		);
		if (currentTile.state == tileState.empty && currentTile.isWatered) {
			if (seeds > 0) {
				currentTile.plant();
				seeds -= 1;
				mouseReleased = false;
			}
		}
		if (currentTile.state == tileState.hasPumpkin) {
			seeds += 2;
			pumpkins += 1;
			currentTile.harvest();
			mouseReleased = false;
		} else {
			currentTile.water();
			mouseReleased = false;
		}
	}
	// Grow
	for (let tile of tiles) {
		tile.grow();
	}
	for (let ghost of ghosts) {
		ghost.search();
	}
	if (ghosts.length < 2 && pumpkins == 25) {
		ghosts.push(new Ghost(850, 850, 850, 850));
	}
	if (ghosts.length < 3 && pumpkins == 50) {
		ghosts.push(new Ghost(850, 0, 850, 0));
	}
	if (ghosts.length < 4 && pumpkins == 75) {
		ghosts.push(new Ghost(0, 850, 0, 850));
	}
};

// init ; update -> draw
init();
setInterval(updateScene, 10);
