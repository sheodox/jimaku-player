<style>
	.logo,
	.logo :global(svg) {
		width: 2rem;
		height: 2rem;
	}
	.logo {
		display: inline-block;
	}
</style>

<div class="logo">
	{@html logo}
</div>

<script lang="ts">
	import logo from '../assets/logo.svg?raw';
</script>
