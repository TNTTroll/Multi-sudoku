class Lobby {
	constructor(max = 6, keySize = 6) {
		this.code_ = helper.generateKey(keySize);
		this.max = max;
		this.users = new Array();
		this.names = new Array();
	}

	isFull () {
		return this.users.length >= this.max
	}

	isPresent (id) {
		this.users.indexOf(id) !== -1;
	}

	enter (id, name) {
		if (!(this.isFull() || this.isPresent(id))) {
			this.users.push(id);
			this.names.push(name);
			return true;
		}
		return false;
	}

	leave (id) {
		(this.users.indexOf(id) !== -1) ? this.users.splice(this.users.indexOf(id), 1) : "";
	}

	print () {
		console.log(this.users)
	}

	get code () {
		return this.code_;
	}
	updateCode () {
		this.code_ = helper.generateKey(keySize);
	}

}

const helper = {
	generateKey : (size = 6) => {
		let key = "";
		let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
		for (i = 0; i < size; i++) {
			let i_ = Math.floor(Math.random() * 36);
			key += chars[i_];
		}
		return key;
	}
}


module.exports = Lobby;
