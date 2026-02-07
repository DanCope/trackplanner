export class SelectionStore {
	selectedPieceId = $state<string | null>(null);

	select(id: string | null): void {
		this.selectedPieceId = id;
	}

	deselect(): void {
		this.selectedPieceId = null;
	}

	isSelected(id: string): boolean {
		return this.selectedPieceId === id;
	}
}

export const selectionStore = new SelectionStore();
