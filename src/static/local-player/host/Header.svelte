<Header appName="字幕プレーヤー" slim={true} {pageName}>
	<svg slot="logo" viewBox="0 0 100 100" id="header-logo">
		<image xlink:href="/assets/logo.svg" />
	</svg>
</Header>

<script lang="ts">
	import { Header } from 'sheodox-ui';
	export let pageName = '';
</script>
