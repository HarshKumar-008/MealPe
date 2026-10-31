import Dexie, { Table } from 'dexie';

export interface PendingScan {
  id?: number;
  qrToken: string;
  scannedAt: string;
  synced: boolean;
}

export class MealPeDatabase extends Dexie {
  pendingScans!: Table<PendingScan>;

  constructor() {
    super('MealPeOfflineDB');
    this.version(1).stores({
      pendingScans: '++id, qrToken, scannedAt, synced',
    });
  }
}

export const db = new MealPeDatabase();