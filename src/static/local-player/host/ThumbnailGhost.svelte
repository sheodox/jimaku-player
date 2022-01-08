<style>
	.ghosts {
		top: 0;
		left: 0;
		position: absolute;
	}
	.ghost {
		position: fixed;
		width: 100vw;
		height: 100vh;
		opacity: 0.15;
		filter: blur(50px);
	}
</style>

<div class="ghosts">
	{#if $selectedGhost}
		<div class="ghost" style={ghostStyles($selectedGhost)} />
	{/if}
</div>

<script lang="ts">
	import { selectedGhost } from './thumbnail-ghosts';

	function ghostStyles(id: string) {
		return `background-image: url(/thumbnails/${id}/medium);`;
	}
</script>
