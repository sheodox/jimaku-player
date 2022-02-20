<a {href} class:inline-link={inline} target="_blank" rel="noreferrer noopener" class={classes}><slot /></a>

<script lang="ts">
	export let href: string;
	export let inline = true;
	export let classes = '';
</script>
