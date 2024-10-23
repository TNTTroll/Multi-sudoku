// --- Class
export class Shower {
	constructor(id, name, display, cellEmpty) {
		this.id = id;
		this.name = name;
		this.display = display;
		this.cellEmpty = cellEmpty;
		
		this.create();
	}

	create() {
		this.buttons = Array(9).fill(0, 0);
		for (let i = 0; i < 9; i++) {
			let col = Array(9).fill(0, 0);
			this.buttons[i] = col;
		}

		let field = document.getElementById("opponents");

		let area = document.createElement('div');
		field.appendChild(area);

		let title = document.createElement('h1');
		title.id = this.id + "_title";
		area.appendChild(title);
		this.status(0);

		for (let i = 0; i < 9; i++) {
			let row = document.createElement('div');

			for (let j = 0; j < 9; j++) {
				let button = document.createElement('button');
				button.id = "OPPONENT_" + this.id + "_" + i + "," + j;
				if (this.display[i][j] != this.cellEmpty)
					button.innerHTML = this.display[i][j];
				else
					button.innerHTML = this.cellEmpty;
				button.disabled = true;

				row.appendChild(button);
				this.buttons[i][j] = button;
			}

			area.appendChild(row);
		}

		this.update(this.display);
	}

	update(newDisplay) {
		this.display = newDisplay;

		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				let button = document.getElementById("OPPONENT_"+this.id+"_"+i+","+j);

				button.className = "opponent";

				if (typeof(this.display[i][j]) == "number") {
					button.innerHTML = this.display[i][j];
					button.className = button.className + " opponent-static";
				}
				else if (this.display[i][j] != this.cellEmpty)
						button.className = button.className + " opponent-inky";

				if (j == 2 || j == 5) button.className += " gap-right";
				if (i == 2 || i == 5) button.className += " gap-bottom";
			}
		}

		this.status(0);
	}

	status(way) {
		let title = document.getElementById(this.id + "_title");

		if (way == 0)
			title.innerHTML = this.name + " " + this.percent() + "%";
		else
			title.innerHTML = this.name + " is looser!";
	}

	percent() {
		let count = 0;
		for (let i = 0; i < 9; i++)
			for (let j = 0; j < 9; j++)
				if (this.display[i][j] == this.cellEmpty)
					count++;

		return parseInt( ((81-count)/81) * 100 );
	}
}