// Placeholder for future AI memory implementation
// This could involve interactions with vector databases, caches, etc.

export interface Memory {
  store(key: string, value: any): Promise<void>;
  retrieve(key: string): Promise<any | null>;
  delete(key: string): Promise<void>;
}

// Example basic in-memory implementation (replace with persistent storage later)
export class InMemoryMemory implements Memory {
  private storage: Map<string, any> = new Map();

  async store(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
  }

  async retrieve(key: string): Promise<any | null> {
    return this.storage.get(key) ?? null;
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

export const defaultMemory = new InMemoryMemory();
