<style lang="scss">
	.toast {
		border-radius: 4px;
		box-shadow: var(--sx-shadow-3);
		font-weight: bold;
		line-height: 1;
		max-width: 15rem;

		&.variant-info {
			background: var(--sx-gray-600);
		}
		&.variant-error {
			background: var(--sx-accent-red);
			color: black;
		}
	}
	.toasts {
		position: fixed;
		bottom: 20%;
		left: 50%;
		transform: translateX(-50%);
	}
</style>

{#if $toasts.length}
	<div class="toasts f-column gap-3 align-items-center">
		{#each $toasts as toast (toast.id)}
			<div class="toast variant-{toast.variant} p-3 sx-font-size-4">
				{toast.message}
			</div>
		{/each}
	</div>
{/if}

<script lang="ts">
	import { toasts } from './stores/toasts';
</script>
