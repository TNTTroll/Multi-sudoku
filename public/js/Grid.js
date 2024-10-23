// --- Defs
// HELPERS
export function rand(max) {
    return Math.floor(Math.random() * max);
}


// --- Class
export class Grid {
	randomisation = 25;
	cellEmpty = "-";

	constructor(difficulty) {
		this.difficulty = difficulty;

		switch (difficulty) {
		case "EASY":
			this.numbers = 79;
			break;
		case "NORMAL":
			this.numbers = 25;
			break;
		case "HARD":
			this.numbers = 20;
			break;
		}
	}

	create() {
		this.delete();

		this.arr = Array(9).fill(0, 0);
		for (let i = 0; i < 9; i++) {
			let col = Array(9).fill(0, 0);
			this.arr[i] = col;
		}

		for (let i = 0; i < 9; i++)
			for (let j = 0; j < 9; j++)
				this.arr[i][j] = ((i*3 + parseInt(i/3) + j) % 9 + 1);


		this.shuffle();


		this.display = Array(9).fill(0, 0);
		for (let i = 0; i < 9; i++) {
			let col = Array(9).fill(0, 0);
			this.display[i] = col;
		}

		for (let i = 0; i < 9; i++)
			for (let j = 0; j < 9; j++)
				this.display[i][j] = this.arr[i][j];


		this.hide();
	}

	set(old) {
		this.arr = old.arr;
		this.display = old.display;
		this.static = old.static;
	}

	show() {
		this.buttons = Array(9).fill(0, 0);
		for (let i = 0; i < 9; i++) {
			let col = Array(9).fill(0, 0);
			this.buttons[i] = col;
		}

		let field = document.getElementById("field");

		for (let i = 0; i < 9; i++) {
			let row = document.createElement('div');
			row.id = "row_" + i;

			for (let j = 0; j < 9; j++) {
				let button = document.createElement('button');
				button.id = i + "," + j + "," + this.arr[i][j];
				button.className = "low";

				row.appendChild(button);
				this.buttons[i][j] = button;
			}

			field.appendChild(row);
		}

		this.update();
	}

	update() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				let button = document.getElementById(i+","+j+","+this.arr[i][j]);
				button.innerHTML = this.display[i][j];

				if (this.static.includes(i*9+j))
					button.className = button.className + " static";
				else 
					button.className = button.className + " inky";

				if (j == 2 || j == 5) button.className += " gap-right";
				if (i == 2 || i == 5) button.className += " gap-bottom";
			}
		}
	}

	delete() {
		let field = document.getElementById("field");
		field.innerHTML = "";
	}

	shuffle() {
		for (let i = 0; i < this.randomisation; i++) {
			let cmd = rand(1);
			switch(cmd) {
			case 0:
				this.shuffleRow();
				break;
			case 1:
				this.shuffleColumn();
				break;
			case 2:
				this.shuffleAreaRow();
				break;
			case 3:
				this.shuffleAreaColumn();
				break;
			case 4:
				this.transponing();
				break;
			}
		}
	}

	hide() {
		let numArr = Array.from(Array(81).keys());

		for(let i = numArr.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random()*(i + 1));
			let temp = numArr[j];
			numArr[j] = numArr[i];
			numArr[i] = temp;
		}

		this.static = Array(this.numbers);
		for (let i = 0; i < 81; i++) {
			if (i < 81-this.numbers) 
				this.display[parseInt(numArr[i]/9)][numArr[i]%9] = this.cellEmpty;
			else
				this.static[81-i-1] = numArr[i];
		}
	}

	// SWITCH
	switchRow(r1, r2) {
		for (let i = 0; i < 9; i++) {
			let save = this.arr[i][r1];
			this.arr[i][r1] = this.arr[i][r2];
			this.arr[i][r2] = save;
		}
	}

	switchColumn(c1, c2) {
		for (let i = 0; i < 9; i++) {
			let save = this.arr[c1][i];
			this.arr[c1][i] = this.arr[c2][i];
			this.arr[c2][i] = save;
		}
	}

	// SHUFFLE
	shuffleRow() {
		let area = rand(3);
		let r1 = rand(3);
		let r2 = rand(3);

		this.switchRow(area*3 + r1, area*3 + r2);
	}

	shuffleColumn() {
		let area = rand(3);
		let c1 = rand(3);
		let c2 = rand(3);

		this.switchColumn(area*3 + c1, area*3 + c2);
	}

	shuffleAreaRow() {
		let area1 = rand(3);
		let area2 = rand(3);

		for (let i = 0; i < 3; i++)
			this.switchRow(area1*3 + i, area2*3 + i);
	}

	shuffleAreaColumn() {
		let area1 = rand(3);
		let area2 = rand(3);

		for (let i = 0; i < 3; i++)
			this.switchColumn(area1*3 + i, area2*3 + i);
	}

	transponing() {
		this.arr = this.arr[0].map((_, colIndex) => this.arr.map(row => row[colIndex]));
	}

	// HELP
	put(pos, number) {
		if (!this.static.includes(pos[0]*9+pos[1]))
			this.display[pos[0]][pos[1]] = number;

		this.update();
	}

	counter(number) {
		let count = 0;
		for (let i = 0; i < 9; i++)
			for (let j = 0; j < 9; j++)
				if (this.display[i][j] == parseInt(number))
					count++;

		return (count >= 9);
	}

	highlight(isAvailable, pos, num) {
		if (isAvailable != null) {	
			for (let i = 0; i < 9; i++)
				for (let j = 0; j < 9; j++) {
					
					let name = "";

					if ((i == pos[0] && j == pos[1]) ||
						this.buttons[i][j].innerHTML == num &&
						num != this.cellEmpty)
						name = "high";
					else if (i == pos[0] || j == pos[1])
						name = "mid";
					else 
						name = "low";
						

					if (this.static.includes(i*9+j))
						name += " static";
					else 
						name += " inky";

					if (j == 2 || j == 5) name += " gap-right";
					if (i == 2 || i == 5) name += " gap-bottom";
					this.buttons[i][j].className = name;
				}
		} else {
			for (let i = 0; i < 9; i++)
				for (let j = 0; j < 9; j++) {
					let name = "";
					if (this.static.includes(i*9+j))
						name = "low static";
					else 
						name = "low inky";

					if (j == 2 || j == 5) name += " gap-right";
					if (i == 2 || i == 5) name += " gap-bottom";
					this.buttons[i][j].className = name;
				}
		} 
	}

	isWin() {
		for (let i = 0; i < 9; i++)
			for (let j = 0; j < 9; j++)
				if (this.arr[i][j] != this.display[i][j])
					return false;

		return true;
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