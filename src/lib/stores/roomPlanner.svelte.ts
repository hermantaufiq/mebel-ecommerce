import type { PlacedRoomItem, Product } from '$lib/types';
import { browser } from '$app/environment';
import { products } from '$lib/mockData';

export type RoomType = 'ruang-tamu' | 'kamar-tidur' | 'ruang-makan';

const ROOM_PLANNER_STORAGE_KEY = 'maison_lumina_room_planner';

export class RoomPlannerStore {
	roomType = $state<RoomType>('ruang-tamu');
	placedItems = $state<PlacedRoomItem[]>([]);
	showGrid = $state<boolean>(true);
	selectedInstanceId = $state<string | null>(null);

	constructor() {
		if (browser) {
			try {
				const stored = localStorage.getItem(ROOM_PLANNER_STORAGE_KEY);
				if (stored) {
					const parsed = JSON.parse(stored);
					if (parsed.roomType) this.roomType = parsed.roomType;
					if (Array.isArray(parsed.placedItems)) this.placedItems = parsed.placedItems;
					if (typeof parsed.showGrid === 'boolean') this.showGrid = parsed.showGrid;
				}
			} catch (err) {
				console.error('Failed to load room planner from localStorage', err);
			}
		}
	}

	get itemCount(): number {
		return this.placedItems.length;
	}

	get totalEstimate(): number {
		return this.placedItems.reduce((sum, item) => sum + (item.product?.price || 0), 0);
	}

	getItemCount(): number {
		return this.itemCount;
	}

	getTotalEstimate(): number {
		return this.totalEstimate;
	}

	private save() {
		if (browser) {
			try {
				localStorage.setItem(
					ROOM_PLANNER_STORAGE_KEY,
					JSON.stringify({
						roomType: this.roomType,
						placedItems: this.placedItems,
						showGrid: this.showGrid
					})
				);
			} catch (err) {
				console.error('Failed to save room planner to localStorage', err);
			}
		}
	}

	setRoomType(type: RoomType, clear = false) {
		this.roomType = type;
		this.selectedInstanceId = null;
		if (clear) {
			this.placedItems = [];
		}
		this.save();
	}

	addToCanvas(product: Product) {
		const instanceId = `canvas-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		// Slight random offset from center
		const jitterX = Math.round(Math.random() * 24 - 12);
		const jitterY = Math.round(Math.random() * 24 - 12);

		const newItem: PlacedRoomItem = {
			instanceId,
			productId: product.id,
			product,
			x: Math.min(Math.max(50 + jitterX, 15), 85),
			y: Math.min(Math.max(50 + jitterY, 15), 85),
			rotation: 0,
			width: 80,
			height: 80
		};

		this.placedItems.push(newItem);
		this.selectedInstanceId = instanceId;
		this.save();
	}

	removeFromCanvas(instanceId: string) {
		this.placedItems = this.placedItems.filter((item) => item.instanceId !== instanceId);
		if (this.selectedInstanceId === instanceId) {
			this.selectedInstanceId = null;
		}
		this.save();
	}

	updatePosition(instanceId: string, x: number, y: number) {
		const item = this.placedItems.find((i) => i.instanceId === instanceId);
		if (item) {
			item.x = Math.max(8, Math.min(92, Math.round(x * 10) / 10));
			item.y = Math.max(8, Math.min(92, Math.round(y * 10) / 10));
			this.save();
		}
	}

	rotateItem(instanceId: string, delta = 45) {
		const item = this.placedItems.find((i) => i.instanceId === instanceId);
		if (item) {
			item.rotation = (item.rotation + delta) % 360;
			this.save();
		}
	}

	selectItem(instanceId: string | null) {
		this.selectedInstanceId = instanceId;
	}

	resetCanvas() {
		this.placedItems = [];
		this.selectedInstanceId = null;
		this.save();
	}

	toggleGrid() {
		this.showGrid = !this.showGrid;
		this.save();
	}

	loadPreset(type: RoomType) {
		this.roomType = type;
		this.selectedInstanceId = null;

		const getProduct = (id: string, fallbackIndex = 0): Product => {
			const found = products.find((p) => p.id === id) ?? products[fallbackIndex];
			if (found) return found;
			return {
				id: 'fallback',
				name: 'Furnitur Atelier',
				slug: 'furnitur-atelier',
				description: '',
				price: 1000000,
				material: 'Jati Solid',
				status: 'Ready Stock',
				rating: 5,
				reviewCount: 1,
				images: [{ id: '1', url: '', sortOrder: 0 }],
				variants: [],
				categoryId: 'cat-ruang-tamu'
			};
		};

		if (type === 'ruang-tamu') {
			const armchair = getProduct('prod-1', 0);
			const lounge = getProduct('prod-2', 1);
			const coffeeTable = getProduct('prod-3', 2);

			this.placedItems = [
				{
					instanceId: `preset-${Date.now()}-1`,
					productId: coffeeTable.id,
					product: coffeeTable,
					x: 50,
					y: 50,
					rotation: 0,
					width: 80,
					height: 80
				},
				{
					instanceId: `preset-${Date.now()}-2`,
					productId: armchair.id,
					product: armchair,
					x: 28,
					y: 50,
					rotation: 90,
					width: 80,
					height: 80
				},
				{
					instanceId: `preset-${Date.now()}-3`,
					productId: lounge.id,
					product: lounge,
					x: 72,
					y: 50,
					rotation: 270,
					width: 80,
					height: 80
				}
			];
		} else if (type === 'kamar-tidur') {
			const bed = getProduct('prod-5', 4);
			const nightstand = getProduct('prod-6', 5);
			const lamp = getProduct('prod-9', 8);

			this.placedItems = [
				{
					instanceId: `preset-${Date.now()}-1`,
					productId: bed.id,
					product: bed,
					x: 50,
					y: 42,
					rotation: 0,
					width: 80,
					height: 80
				},
				{
					instanceId: `preset-${Date.now()}-2`,
					productId: nightstand.id,
					product: nightstand,
					x: 26,
					y: 35,
					rotation: 0,
					width: 80,
					height: 80
				},
				{
					instanceId: `preset-${Date.now()}-3`,
					productId: lamp.id,
					product: lamp,
					x: 26,
					y: 22,
					rotation: 0,
					width: 80,
					height: 80
				}
			];
		} else if (type === 'ruang-makan') {
			const table = getProduct('prod-7', 6);
			const chair1 = getProduct('prod-8', 7);
			const chair2 = getProduct('prod-8', 7);

			this.placedItems = [
				{
					instanceId: `preset-${Date.now()}-1`,
					productId: table.id,
					product: table,
					x: 50,
					y: 50,
					rotation: 0,
					width: 80,
					height: 80
				},
				{
					instanceId: `preset-${Date.now()}-2`,
					productId: chair1.id,
					product: chair1,
					x: 50,
					y: 28,
					rotation: 180,
					width: 80,
					height: 80
				},
				{
					instanceId: `preset-${Date.now()}-3`,
					productId: chair2.id,
					product: chair2,
					x: 50,
					y: 72,
					rotation: 0,
					width: 80,
					height: 80
				}
			];
		}
		this.save();
	}
}

export const roomPlannerStore = new RoomPlannerStore();
