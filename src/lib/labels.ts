import { z } from 'astro/zod';

// Defines the recursive tree structure for labels
export interface LabelNode {
  readonly children?: Record<string, LabelNode>;
  readonly description?: string;
  readonly label: string; // The display name
}

// Root of the label tree
export type LabelTree = Record<string, LabelNode>;

// The Source of Truth for all labels in the system
export const LABEL_TREE = {
  culture: {
    children: {
      food: { label: 'Food' },
    },
    label: 'Culture',
  },
  // Root level specific topics
  demo: { label: 'Demo' },
  finance: {
    children: {
      budget: { label: 'Budgeting' },
    },
    description: 'Personal finance and money management',
    label: 'Finance',
  },
  process: {
    description: 'Workflows, agile, and management',
    label: 'Process'
  },
  tech: {
    children: {
      ai: { label: 'Artificial Intelligence' },
      mobile: { label: 'Mobile Development' },
      web: {
        children: {
          astro: { label: 'Astro' },
          components: { label: 'Components' },
          leaflet: { label: 'Leaflet' },
          maps: { label: 'Maps' },
          react: { label: 'React' },
          typescript: { label: 'TypeScript' },
          visualization: { label: 'Visualization' },
        },
        label: 'Web Development',
      },
    },
    description: 'Technical topics and engineering',
    label: 'Technology',
  },
} as const satisfies LabelTree;

// --- Helpers ---

type FlattenedLabel = Omit<LabelNode, 'children'> & Readonly<{ parentId?: string }>;
type FlattenedLabels = Record<string, FlattenedLabel>;

/**
 * Flattens the recursive tree into a single map of ID -> Metadata + ParentID.
 * This enables O(1) lookup and easy Zod validation.
 */
const flattenLabels = (tree: LabelTree, parentId?: string): FlattenedLabels => {
  return Object.entries(tree).reduce<FlattenedLabels>((acc, [key, node]) => {
    const { children, ...meta } = node;

    // Base object for this node
    const current: FlattenedLabels = {
      [key]: { ...meta, parentId }
    };

    // If no children, just return current accumulated with this node
    if (!children) {
      return { ...acc, ...current };
    }

    // If children exist, recursively flatten them and merge
    return {
      ...acc,
      ...current,
      ...flattenLabels(children, key)
    };
  }, {});
};

// Computed flattened map
export const FLATTENED_LABELS = flattenLabels(LABEL_TREE as unknown as LabelTree);

// Create the Zod Schema
// We cast to [string, ...string[]] because z.enum expects a non-empty array tuple
const labelKeys = Object.keys(FLATTENED_LABELS) as [string, ...string[]];
export const LabelIdSchema = z.enum(labelKeys);

// The set of all valid label IDs
export type LabelId = z.infer<typeof LabelIdSchema>;

export function getLabelMetadata(id: LabelId) {
  return FLATTENED_LABELS[id];
}

export function isValidLabel(id: string): id is LabelId {
  return id in FLATTENED_LABELS;
}

/**
 * Returns the full hierarchy for a given label, from root to leaf.
 * Purely functional using the flattened parent pointers.
 * Example: 'astro' -> ['tech', 'web', 'astro']
 */
export function getLabelHierarchy(id: LabelId): readonly LabelId[] {
  const getPath = (currentId: string | undefined): readonly string[] => {
    if (!currentId || !isValidLabel(currentId)) return [];
    const meta = FLATTENED_LABELS[currentId as LabelId];
    return [...getPath(meta.parentId), currentId];
  };

  return getPath(id) as readonly LabelId[];
}
