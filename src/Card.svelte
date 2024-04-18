<script lang="ts">
	import { WormCard, WormSpell } from '$lib/worms';

	export let card: any;
	export let blue: boolean = false;
	export let red: boolean = false;

	export let id = -1;
	export let onClick: (id: number) => void = () => {};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={'card ' + (blue ? 'blueBorder' : red ? 'redBorder' : '')}
	on:click={() => {
		onClick(id);
	}}
>
	{#if card instanceof WormCard || card instanceof WormSpell}
		{#each card.display() as stat}
			<p>{stat}</p>
		{/each}
	{:else}
		<p>Empty</p>
	{/if}
</div>

<style>
	.card > p {
		margin: 5px;
		text-align: center;
	}

	.card {
		width: 100px;
		height: 150px;
		border-radius: 10px;
		border: 3px solid grey;
		margin: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.blueBorder {
		border: 3px solid blue;
	}

	.redBorder {
		border: 3px solid red;
	}
</style>
