<script lang="ts">
	import { WormCard, WormSpell } from '$lib/worms';

	export let card: any;
	export let blue: boolean = false;
	export let red: boolean = false;

	export let id = -1;
	export let onClick: (id: number) => void = () => {};

	export let targeted = false;
	export let highlighted = false;
	export let selected = false;
	export let tired = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={'card' +
		(blue ? ' blueBorder' : red ? ' redBorder' : '') +
		(targeted ? ' targeted' : '') +
		(highlighted ? ' highlighted' : '') +
		(selected ? ' selected' : '') +
		(tired ? ' tired' : '')}
	on:click={() => {
		onClick(id);
	}}
>
	{#if card instanceof WormCard || card instanceof WormSpell}
		{#each card.display() as stat}
			<p>{stat}</p>
		{/each}
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

	.targeted {
		border: 3px solid orange;
	}

	.highlighted {
		border: 3px solid turquoise;
	}

	.selected {
		border: 3px solid yellowgreen;
	}

	.tired {
		border: 3px solid darkslategray;
	}
</style>
