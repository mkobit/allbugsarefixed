export type TagCategory = 'technology' | 'process' | 'misc';

export interface TagMetadata {
  readonly color?: 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info';
  readonly description?: string;
  readonly label: string;
  readonly parent?: string; // ID of the parent tag
}

// Hierarchical definition of tags
// This acts as the single source of truth
export const TAG_DEFINITIONS: Record<string, TagMetadata> = {
  // Level 1: Roots
  'ai': { color: 'brand', label: 'Artificial Intelligence', parent: 'tech' },
  'astro': { color: 'brand', label: 'Astro', parent: 'web' },
  'components': { color: 'brand', label: 'Components', parent: 'web' },
  'demo': { color: 'success', label: 'Demo' },
  'design': { color: 'warning', description: 'UI/UX and visual design', label: 'Design' },
  'leaflet': { color: 'brand', label: 'Leaflet', parent: 'web' },
  'maps': { color: 'info', label: 'Maps', parent: 'web' },
  'mobile': { color: 'brand', label: 'Mobile Development', parent: 'tech' },
  'process': { color: 'info', description: 'Workflows, agile, and management', label: 'Process' },
  'react': { color: 'brand', label: 'React', parent: 'web' },
  'style': { color: 'warning', label: 'Styling', parent: 'design' },
  'tech': { color: 'brand', description: 'Technical topics and engineering', label: 'Technology' },
  'typescript': { color: 'brand', label: 'TypeScript', parent: 'web' },
  'visualization': { color: 'brand', label: 'Visualization', parent: 'web' },
  'web': { color: 'brand', label: 'Web Development', parent: 'tech' },
} as const;

export type TagId = keyof typeof TAG_DEFINITIONS;

export function getTagMetadata(id: TagId): TagMetadata {
  return TAG_DEFINITIONS[id];
}

export function isValidTag(id: string): id is TagId {
  return id in TAG_DEFINITIONS;
}

/**
 * Returns the full hierarchy for a given tag, from root to leaf.
 * Example: 'astro' -> ['tech', 'web', 'astro']
 */
export function getTagHierarchy(id: TagId): readonly TagId[] {
  // Recursive function to build path without loops/mutations
  const getParentPath = (currentId: TagId, currentDepth: number): readonly TagId[] => {
    if (currentDepth > 10) return [];

    const meta = TAG_DEFINITIONS[currentId];
    if (meta.parent && isValidTag(meta.parent)) {
      return [...getParentPath(meta.parent as TagId, currentDepth + 1), currentId];
    }
    return [currentId];
  };

  return getParentPath(id, 0);
}
