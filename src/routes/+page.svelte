<script lang="ts">
	import { Game, WormCard, WormSpell } from '$lib/worms';
	import Card from '../Card.svelte';

	let game = new Game();
	let selectedCardId: number = -1;
</script>

{#if game.p1Turn}
	<h1 style="color: blue">Player 1</h1>
{:else}
	<h1 style="color: red">Player 2</h1>
{/if}

<div class="hand">
	{#each game.p2.board as card, id}
		<Card
			{card}
			red
			{id}
			onClick={(id) => {
				if (!game.p1Turn && card == undefined) {
					game.p2.board[id] = game.hand[selectedCardId];
					game.hand.splice(selectedCardId, 1);
					game = game;
					selectedCardId = -1;
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
			{id}
			onClick={(id) => {
				if (game.p1Turn && card == undefined) {
					game.p1.board[id] = game.hand[selectedCardId];
					game.hand.splice(selectedCardId, 1);
					game = game;
					selectedCardId = -1;
				}
			}}
		></Card>
	{/each}
</div>

<div class="hand">
	{#each game.hand as card, id}
		<Card
			{card}
			{id}
			onClick={() => {
				selectedCardId = id;
			}}
		></Card>
	{/each}
</div>

<button
	on:click={() => {
		game.turn();
		game = game;
	}}>Turn</button
>

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
</style>
