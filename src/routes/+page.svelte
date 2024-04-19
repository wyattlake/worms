<script lang="ts">
	import { Game, TargetType, WormCard, WormSpell, isValidTarget } from '$lib/worms';
	import Card from '../Card.svelte';

	let game = new Game();
	let selectedCardId: number = -1;
	let fighting = true;

	let p1TargetCards: Array<number> = [];
	let p2TargetCards: Array<number> = [];

	function updateTargetCards(attackerCard: WormCard | WormSpell) {
		p1TargetCards = [];
		p2TargetCards = [];

		for (let i = 0; i < game.p1.board.length; i++) {
			const card = game.p1.board[i];
			if (card != undefined && attackerCard != undefined) {
				if (isValidTarget(attackerCard, game.p1Turn, true)) {
					p1TargetCards.push(i);
				}
			}
		}

		for (let i = 0; i < game.p2.board.length; i++) {
			const card = game.p2.board[i];
			if (card != undefined && attackerCard != undefined) {
				if (isValidTarget(attackerCard, game.p1Turn, false)) {
					p2TargetCards.push(i);
				}
			}
		}

		console.log(p1TargetCards);

		p1TargetCards = p1TargetCards;
		p2TargetCards = p2TargetCards;
	}

	function deselect() {
		selectedCardId = -1;
		p1TargetCards = [];
		p2TargetCards = [];
	}

	function playerLeaves() {
		return game.p1Turn ? game.p1.leaves : game.p2.leaves;
	}

	function resetAttack() {
		if (game.p1Turn) {
			for (var card of game.p1.board) {
				if (card instanceof WormCard) {
					card.turnReset();
				}
			}
		} else {
			for (var card of game.p2.board) {
				if (card instanceof WormCard) {
					card.turnReset();
				}
			}
		}
	}
</script>

<div class="playerInfo">
	{#if game.p1Turn}
		<h1 style="color: blue">Player 1</h1>
		<h1>Leaves: {game.p1.leaves}</h1>
	{:else}
		<h1 style="color: red">Player 2</h1>
		<h1>Leaves: {game.p2.leaves}</h1>
	{/if}
	{#if fighting}
		<h1>Attack</h1>
	{:else}
		<h1>Place Cards</h1>
	{/if}
</div>

<div class="hand">
	{#each game.p2.board as card, id}
		<Card
			{card}
			red
			targeted={p2TargetCards.includes(id)}
			selected={fighting && !game.p1Turn && selectedCardId == id}
			tired={fighting && !game.p1Turn && card instanceof WormCard && card.attackCount < 1}
			{id}
			onClick={(id) => {
				if (fighting) {
					if (card == undefined) {
						return;
					}

					if (game.p1Turn) {
						if (selectedCardId == -1) {
							return;
						}

						// Attack code
						if (p2TargetCards.includes(id) && card instanceof WormCard && selectedCardId != -1) {
							const attackerCard = game.p1.board[selectedCardId];
							if (attackerCard instanceof WormCard && attackerCard.attackCount > 0) {
								card.battle(attackerCard);

								if (card.health < 1) {
									game.p2.board[id] = undefined;
								}

								if (attackerCard.health < 1) {
									game.p1.board[selectedCardId] = undefined;
								}

								attackerCard.attackCount--;
								game = game;
								deselect();
							}
						}
					} else {
						if (card instanceof WormCard && card.attackCount > 0) {
							selectedCardId = id;
							updateTargetCards(card);
						}
					}
				} else {
					if (selectedCardId == -1) {
						return;
					}

					const selectedCard = game.hand[selectedCardId];

					if (
						!game.p1Turn &&
						card == undefined &&
						selectedCard instanceof WormCard &&
						selectedCard.cost <= game.p2.leaves
					) {
						game.p2.board[id] = selectedCard;
						game.hand.splice(selectedCardId, 1);
						game.p2.leaves -= selectedCard.cost;
						game = game;
						deselect();
					}
				}
			}}
		></Card>
	{/each}
</div>

<div class="hand">
	{#each game.p1.board as card, id}
		<Card
			{card}
			blue
			targeted={p1TargetCards.includes(id)}
			selected={fighting && game.p1Turn && selectedCardId == id}
			tired={fighting && game.p1Turn && card instanceof WormCard && card.attackCount < 1}
			{id}
			onClick={(id) => {
				if (fighting) {
					if (card == undefined) {
						return;
					}

					if (!game.p1Turn) {
						if (selectedCardId == -1) {
							return;
						}

						// Attack code
						if (p1TargetCards.includes(id) && card instanceof WormCard && selectedCardId != -1) {
							const attackerCard = game.p2.board[selectedCardId];
							if (attackerCard instanceof WormCard && attackerCard.attackCount > 0) {
								card.battle(attackerCard);

								if (card.health < 1) {
									game.p1.board[id] = undefined;
								}

								if (attackerCard.health < 1) {
									game.p2.board[selectedCardId] = undefined;
								}

								attackerCard.attackCount--;
								game = game;
								deselect();
							}
						}
					} else {
						if (card instanceof WormCard && card.attackCount > 0) {
							selectedCardId = id;
							updateTargetCards(card);
						}
					}
				} else {
					if (selectedCardId == -1) {
						return;
					}
					const selectedCard = game.hand[selectedCardId];
					if (
						game.p1Turn &&
						card == undefined &&
						selectedCard instanceof WormCard &&
						selectedCard.cost <= game.p1.leaves
					) {
						game.p1.board[id] = selectedCard;
						game.hand.splice(selectedCardId, 1);
						game.p1.leaves -= selectedCard.cost;
						game = game;
						deselect();
					}
				}
			}}
		></Card>
	{/each}
</div>

{#if !fighting}
	<div class="hand">
		{#each game.hand as card, id}
			<Card
				{card}
				{id}
				highlighted={card.cost <= playerLeaves()}
				selected={!fighting && selectedCardId == id}
				onClick={() => {
					if (card != undefined && card.cost <= playerLeaves()) {
						selectedCardId = id;
						if (card instanceof WormSpell) {
							updateTargetCards(card);
						} else {
							p1TargetCards = [];
							p2TargetCards = [];
						}
					}
				}}
			></Card>
		{/each}
	</div>
{/if}

<div class="controlBar">
	{#if selectedCardId != -1 && !fighting && game.hand[selectedCardId] != undefined && game.hand[selectedCardId].targetType == TargetType.None}
		<button
			on:click={() => {
				const card = game.hand[selectedCardId];
				if (game.p1Turn) {
					game.p1.leaves -= card.cost;
				} else {
					game.p2.leaves -= card.cost;
				}

				game.hand.splice(selectedCardId, 1);
				deselect();
			}}>Play Spell</button
		>
	{/if}

	<button
		on:click={() => {
			if (fighting) {
				game.turn();
				game = game;
				fighting = false;

				deselect();
			} else {
				fighting = true;
				resetAttack();

				deselect();
			}
		}}>Next</button
	>
</div>

<style>
	:global(body) {
		margin: 0px;
		padding: 0px;
	}

	.hand {
		display: flex;
		flex-direction: row;
		width: 100%;
		align-items: center;
		justify-content: center;
	}

	.playerInfo {
		display: flex;
		flex-direction: row;
		width: 100%;
		justify-content: center;
		align-items: center;
		margin-top: 20px;
	}

	.playerInfo > h1 {
		margin: 0px 20px;
	}

	.controlBar {
		display: flex;
		flex-direction: row;
		width: 100%;
		justify-content: center;
		align-items: center;
	}

	button {
		height: 50px;
		padding: 0px 20px;
		font-size: 30px;
		margin: 0px 20px;
	}
</style>
