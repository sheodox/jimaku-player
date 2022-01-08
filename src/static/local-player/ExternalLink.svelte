<a {href} class:inline-link={inline} target="_blank" rel="noreferrer noopener"><slot /></a>

<script lang="ts">
	export let href: string;
	export let inline = true;
</script>
