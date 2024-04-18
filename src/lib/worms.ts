export class WormCard {
	constructor(
		public name: string,
		public attack: number,
		public health: number,
		public cost: number
	) {}

	display(): Array<string> {
		return [
			this.name,
			'ATK: ' + this.attack,
			'HP: ' + this.health.toString(),
			'COST: ' + this.cost.toString()
		];
	}
}

export class WormSpell {
	constructor(
		public name: string,
		public cost: number
	) {}

	display(): Array<string> {
		return [this.name, 'COST: ' + this.cost.toString()];
	}
}

function cardFromId(id: number): WormCard | WormSpell {
	switch (id) {
		case 0:
			return new WormCard('Grub', 1, 2, 1);
		case 1:
			return new WormCard('Inchworm', 2, 1, 1);
		case 2:
			return new WormCard('Mealworm', 0, 3, 1);
		case 3:
			return new WormCard('Earthworm', 3, 3, 2);
		case 4:
			return new WormSpell('Gummy Worm', 2);
		case 5:
			return new WormSpell('Tape Worm', 2);
		case 100:
			return new WormCard('Glow Worm', 2, 2, 2);
		case 101:
			return new WormCard('Silk Worm', 2, 2, 2);
		case 102:
			return new WormCard('Split Worm', 2, 2, 2);
		case 103:
			return new WormCard('Bait', 0, 3, 2);
		case 104:
			return new WormCard('Earworm', 0, 3, 2);
		case 105:
			return new WormSpell('Rain', 3);
		case 106:
			return new WormSpell('Ringworm', 3);
		case 200:
			return new WormCard('Soldier Worm', 6, 4, 4);
		case 201:
			return new WormCard('Worm Rider', 3, 5, 4); //x2 damage for 2 attacks
		case 202:
			return new WormCard('Wormsworth', 5, 5, 3);
		case 203:
			return new WormCard('Snake', 7, 7, 5);
		case 204:
			return new WormSpell('Early Bird', 3);
		case 205:
			return new WormSpell('Can of Worms', 3);
		case 300:
			return new WormCard('Computer Worm', 3, 3, 3); // Self replicates with +1 +1 stats
		case 301:
			return new WormCard('Shai Hulud', 9, 9, 6);
		case 302:
			return new WormCard('Alaskan Bull Worm', 4, 4, 6); //Spawns two other 4 4 cards
		case 303:
			return new WormSpell('Wormhole', 3);
		default:
			return new WormSpell('ERROR', -1);
	}
}

class WormPlayer {
	board: Array<WormCard | WormSpell | undefined> = [
		undefined,
		undefined,
		undefined,
		undefined,
		undefined
	];

	constructor(public health: number) {}
}

function randRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export class Game {
	public p1: WormPlayer;
	public p2: WormPlayer;
	public hand: Array<WormCard | WormSpell> = [];
	public p1Turn: boolean = false;

	constructor() {
		this.p1 = new WormPlayer(50);
		this.p2 = new WormPlayer(50);
	}

	turn() {
		this.hand = drawHand();
		console.log('hi');
		this.p1Turn = !this.p1Turn;
	}
}

function drawCard(): WormCard | WormSpell {
	const rarityRand = randRange(1, 25);

	if (rarityRand < 10) {
		return cardFromId(randRange(0, 5));
	} else if (rarityRand < 20) {
		return cardFromId(randRange(100, 106));
	} else if (rarityRand < 25) {
		return cardFromId(randRange(200, 205));
	} else {
		return cardFromId(randRange(300, 303));
	}
}

function drawHand(): Array<WormCard | WormSpell> {
	const hand: Array<WormCard | WormSpell> = [];
	for (let i = 0; i < 5; i++) {
		hand.push(drawCard());
	}

	return hand;
}
