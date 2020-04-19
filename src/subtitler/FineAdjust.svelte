<style>
	.fine-align {
		background: rgba(27, 26, 38, 0.9);
        padding: 1rem;
		color: white;
		position: fixed;
		top: 60vh;
		left: 50vw;
		transform: translate(-50%, -50%);
		max-width: 20rem;
	}
    h1 {
		border-bottom: 2px solid #f47521;
	}
</style>
<div class="fine-align">
	<h1>Fine Alignment</h1>
	<p>
		Play the video and use these adjustment buttons until the subtitles show at the right time.
		<br>
		<strong>Alignment: {alignment > 0 ? '+' : ''}{(alignment / 1000).toFixed(2)} seconds.</strong>
	</p>
	<p>
		Do the subtitles show...
	</p>
	<button on:click={() => alignment -= coarseAdjustAmount} class="secondary">Way too late?</button>
	<button on:click={() => alignment -= fineAdjustAmount} class="secondary">Too late?</button>
	<button on:click={() => alignment += fineAdjustAmount} class="secondary">Too early?</button>
	<button on:click={() => alignment += coarseAdjustAmount} class="secondary">Way too early?</button>
	<br>
	<button on:click={() => dispatch('close')}>Done</button>
</div>
<script>
	import {createEventDispatcher} from 'svelte';
	export let alignment;
	const dispatch = createEventDispatcher(),
		//ms that alignment is adjusted by with each click
		coarseAdjustAmount = 1000,
		fineAdjustAmount = 200;
</script>