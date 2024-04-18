class WormCard {
	constructor(
		private attack: number,
		public health: number
	) {}

	fromId(id: number) {
		switch (id) {
			case 0:
				return new WormCard(1, 1);
		}
	}
}

class WormPlayer {
	board: Array<WormCard | undefined> = [undefined, undefined, undefined, undefined, undefined];

	constructor(public health: number) {}
}

class Game {
	constructor(
		private p1: WormPlayer,
		private p2: WormPlayer
	) {}

	getHand() {
		const rand = Math.floor(Math.random() * 10) + 1;

		if (rand < 5) {
			return;
		} else if (rand < 8) {
			return;
		} else {
			return;
		}
	}
}

export default Game;
