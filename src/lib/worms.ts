export enum TargetType {
	None,
	Self,
	Enemy,
	Soldier
}

export class WormCard {
	public attackCount: number;

	constructor(
		public name: string,
		public attack: number,
		public health: number,
		public cost: number,
		public targetType: TargetType = TargetType.Enemy,
		public maxAttackCount: number = 1
	) {
		this.health = health;
		this.attackCount = -1;
	}

	display(): Array<string> {
		return [
			this.name,
			'ATK: ' + this.attack,
			'HP: ' + this.health.toString(),
			'COST: ' + this.cost.toString()
		];
	}

	turnReset() {
		// A card cannot attack right after it is placed
		if (this.attackCount == -1) {
			this.attackCount = 0;
		} else {
			this.attackCount = this.maxAttackCount;
		}
	}

	battle(attacker: WormCard) {
		this.health -= attacker.attack;
		attacker.health -= this.attack;
	}
}

export class WormSpell {
	constructor(
		public name: string,
		public cost: number,
		public targetType: TargetType = TargetType.Enemy
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
			return new WormCard('Mealworm', 0, 3, 1, TargetType.Enemy, 0); // Gives +1 health on death
		case 3:
			return new WormCard('Earthworm', 3, 3, 2);
		case 4:
			return new WormSpell('Gummy Worm', 2, TargetType.Self); // Heal spell
		case 5:
			return new WormSpell('Tape Worm', 2); // Damage spell
		case 100:
			return new WormCard('Glow Worm', 2, 2, 2); // Must be killed before other worms
		case 101:
			return new WormCard('Split Worm', 2, 2, 2); // Splits into two on death
		case 102:
			return new WormCard('Bait', 0, 3, 2, TargetType.Enemy, 0); // Damages attacker on death
		case 103:
			return new WormCard('Earworm', 0, 3, 2, TargetType.Enemy, 0);
		case 104:
			return new WormSpell('Rain', 3, TargetType.None); // Heals all cards
		case 105:
			return new WormSpell('Ringworm', 3, TargetType.None); // Damages all cards
		case 200:
			return new WormCard('Soldier Worm', 6, 4, 4); // Can hit opponent directly
		case 201:
			return new WormCard('Worm Rider', 3, 5, 4, TargetType.Enemy, 2); //x2 damage for 2 attacks
		case 202:
			return new WormCard('Wormsworth', 5, 5, 3); // +2 draw cards if wormsworth is alive
		case 203:
			return new WormCard('Snake', 6, 6, 5); // Can attack without being hit
		case 204:
			return new WormCard('Silk Worm', 1, 2, 2); // Traps enemy in silk, they cannot attack next turn
		case 205:
			return new WormSpell('Early Bird', 3, TargetType.None); // Kills random enemy next turn
		case 206:
			return new WormSpell('Can of Worms', 3, TargetType.None); // Fills free spaces with worms
		case 300:
			return new WormCard('Computer Worm', 2, 2, 4); // Self replicates on death with +1 +1 stats
		case 301:
			return new WormCard('Shai Hulud', 9, 9, 6); // Gives spice card (spell) each turn which gives +2 ATK -1 DEF
		case 302:
			return new WormCard('Alaskan Bull Worm', 4, 4, 6); //Spawns two other 4 4 cards to the left
		case 303:
			return new WormSpell('Wormhole', 3); // Swaps cards in the same column
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

	leaves: number = 0;

	constructor(public health: number) {}
}

export function isValidTarget(
	attacker: WormCard | WormSpell,
	attackerP1: boolean,
	targetP1: boolean
) {
	switch (attacker.targetType) {
		case TargetType.None:
			return false;
		case TargetType.Self:
			return attackerP1 == targetP1;
		case TargetType.Enemy:
			return attackerP1 != targetP1;
		case TargetType.Soldier:
			return attackerP1 != targetP1;
	}
}

function randRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export class Game {
	public p1: WormPlayer;
	public p2: WormPlayer;
	public hand: Array<WormCard | WormSpell> = [];
	public p1Turn: boolean = false;
	private leavesPerTurn: number = 2;

	constructor() {
		this.p1 = new WormPlayer(50);
		this.p2 = new WormPlayer(50);
	}

	turn() {
		this.p1Turn = !this.p1Turn;

		this.hand = drawHand();

		if (this.p1Turn) {
			this.p1.leaves += this.leavesPerTurn;
		} else {
			this.p2.leaves += this.leavesPerTurn;
			if (this.leavesPerTurn < 5) {
				this.leavesPerTurn++;
			}
		}
	}
}

function drawCard(): WormCard | WormSpell {
	const rarityRand = randRange(1, 25);

	if (rarityRand < 10) {
		return cardFromId(randRange(0, 5));
	} else if (rarityRand < 20) {
		return cardFromId(randRange(100, 105));
	} else if (rarityRand < 25) {
		return cardFromId(randRange(200, 206));
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
