//boilerplate
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();

const { world } = engine;
engine.world.gravity.y = 0;

const width = window.innerWidth;
const height = window.innerHeight;

const xCells = 15;
const yCells = 10;

const xUnitLength = width / xCells;
const yUnitLength = width / yCells;

const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: false,
		width,
		height
	}
});

Render.run(render);
Runner.run(Runner.create(), engine);

//Start\\

//Walls as borders\\
const walls = [
	Bodies.rectangle(width / 2, 0, width, 2, {
		isStatic: true
	}),
	Bodies.rectangle(width, height / 2, 2, height, {
		isStatic: true
	}),
	Bodies.rectangle(width / 2, height, width, 2, {
		isStatic: true
	}),
	Bodies.rectangle(0, height / 2, 2, height, {
		isStatic: true
	})
];
World.add(world, walls);

//maze genreation

const grid = Array(yCells).fill(null).map(() => Array(xCells).fill(false));

const verticals = Array(yCells).fill(null).map(() => Array(xCells - 1).fill(false));

const horizontals = Array(yCells - 1).fill(null).map(() => Array(xCells).fill(false));

const startRow = Math.floor(Math.random() * yCells);
const startColumns = Math.floor(Math.random() * xCells);

// logic
const stepThroughCell = (row, column) => {
	//starting position
	if (grid[row][column]) {
		return;
	}

	grid[row][column] = true;

	//randomize the maze creation of neighbors
	const shuffle = (arr) => {
		let counter = arr.length;

		while (counter > 0) {
			//finding random index
			const index = Math.floor(Math.random() * counter);

			counter--;
			// swaping element to randomize the order
			const temp = arr[counter];
			arr[counter] = arr[index];
			arr[index] = temp;
		}

		return arr;
	};

	//make neighbors list
	const neighbors = shuffle([
		[ row - 1, column, 'up' ],
		[ row, column + 1, 'right' ],
		[ row + 1, column, 'down' ],
		[ row, column - 1, 'left' ]
	]);

	//for each neighbor
	for (const neighbour of neighbors) {
		[ nextRow, nextColumn, direction ] = neighbour;
		//check if next cell is out of bounds
		if (nextRow < 0 || nextRow >= yCells || nextColumn < 0 || nextColumn >= xCells) {
			continue;
		}
		// if we visited the neghbour continue to next
		if (grid[nextRow][nextColumn]) {
			continue;
		}

		//decide where to move by removing the walls in this direction
		if (direction === 'left') {
			verticals[row][column - 1] = true;
		} else if (direction === 'right') {
			verticals[row][column] = true;
		} else if (direction === 'up') {
			horizontals[row - 1][column] = true;
		} else if (direction === 'down') {
			horizontals[row][column] = true;
		}

		stepThroughCell(nextRow, nextColumn);
	}
};

stepThroughCell(startRow, startColumns);

//render walls
horizontals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		} else {
			const wall = Bodies.rectangle(
				columnIndex * xUnitLength + xUnitLength / 2,
				rowIndex * yUnitLength + yUnitLength,
				xUnitLength,
				5,
				{
					label: 'wall',
					isStatic: true,
					render: {
						fillStyle: 'red'
					}
				}
			);

			World.add(world, wall);
		}
	});
});

verticals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		} else {
			const wall = Bodies.rectangle(
				columnIndex * xUnitLength + xUnitLength,
				rowIndex * yUnitLength + yUnitLength / 2,
				5,
				yUnitLength,
				{
					label: 'wall',
					isStatic: true,
					render: {
						fillStyle: 'red'
					}
				}
			);

			World.add(world, wall);
		}
	});
});

//THE GOAL\\

const goal = Bodies.rectangle(width - xUnitLength / 2, height - yUnitLength / 2, xUnitLength * 0.7, yUnitLength * 0.7, {
	isStatic: true,
	label: 'goal',
	render: {
		fillStyle: 'green'
	}
});

World.add(world, goal);

//THE BALL\\
const ballRadius = Math.min(xUnitLength, yUnitLength) / 4;
const ball = Bodies.circle(xUnitLength / 2, yUnitLength / 2, ballRadius, {
	label: 'ball',
	render: {
		fillStyle: 'blue'
	}
});
World.add(world, ball);

//ball movement
document.addEventListener('keydown', (e) => {
	const { x, y } = ball.velocity;
	if (e.keyCode === 87 || e.keyCode === 38) {
		Body.setVelocity(ball, { x: x, y: y - 5 });
	} else if (e.keyCode === 68 || e.keyCode === 39) {
		Body.setVelocity(ball, { x: x + 5, y: y });
	} else if (e.keyCode === 83 || e.keyCode === 40) {
		Body.setVelocity(ball, { x: x, y: y + 5 });
	} else if (e.keyCode === 65 || e.keyCode === 37) {
		Body.setVelocity(ball, { x: x - 5, y: y });
	}
});

//on wining\\

Events.on(engine, 'collisionStart', (e) => {
	e.pairs.forEach((collision) => {
		const labels = [ 'ball', 'goal' ];
		if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
			world.gravity.y = 1;

			world.bodies.forEach((body) => {
				if (body.label === 'wall') {
					Body.setStatic(body, false);
					const winMessage = document.querySelector('.winner');
					winMessage.classList.remove('hidden');

					setInterval(() => {
						document.querySelector('head').innerHTML += '<meta http-equiv="refresh" content="5">';

						window.location.reload();
					}, 3000);
				}
			});
		}
	});
});
