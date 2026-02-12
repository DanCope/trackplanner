<script lang="ts">
	import { layoutStore } from '$lib/stores/layout.svelte';
	import { selectionStore } from '$lib/stores/selection.svelte';

	function handleDelete(): void {
		if (!selectionStore.selectedPieceId) {
			return;
		}

		layoutStore.removePiece(selectionStore.selectedPieceId);
		selectionStore.deselect();
	}

	const selectedPiece = $derived(
		selectionStore.selectedPieceId ? layoutStore.getPiece(selectionStore.selectedPieceId) : null
	);
</script>

<div class="toolbar">
	<button
		class="delete-button"
		onclick={handleDelete}
		disabled={!selectionStore.selectedPieceId}
		aria-label="Delete selected piece"
	>
		Delete Selected
	</button>

	<span class="info">
		Pieces: {layoutStore.pieces.length}
		{#if selectedPiece}
			<span class="selected-info">
				| Selected: {selectedPiece.definition.type}
			</span>
		{/if}
	</span>
</div>

<style>
	.toolbar {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding: 0.75rem 1.5rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.delete-button {
		padding: 0.5rem 1rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background-color 150ms ease;
	}

	.delete-button:hover:not(:disabled) {
		background: #dc2626;
	}

	.delete-button:disabled {
		background: #d1d5db;
		cursor: not-allowed;
	}

	.info {
		margin-left: auto;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.selected-info {
		color: #3b82f6;
		font-weight: 500;
	}
</style>
