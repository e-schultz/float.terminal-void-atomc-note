export interface Annotation {
  type: string;
  content: string;
  marker: string;
}

export interface Node {
  id: string;
  parentId?: string;
  title: string;
  marker?: string;
  type?: string;
  timestamp?: string;
  description?: string;
  tags?: string[];
  annotations?: Annotation[];
  children?: string[];
  // Dynamic properties from the user's AST
  themes?: string[];
  reduxMapping?: Record<string, string>;
  systemTools?: string[];
}

export interface Edge {
  from: string;
  to: string;
  type: string;
  via?: string;
}

export interface FloatQLData {
  meta: any;
  nodes: Node[];
  edges: Edge[];
  systemStack?: any;
  annotationTypes?: any;
}

// Editor Specific Types
export interface BlockData {
  id: string;
  content: string;
  parentId: string | null;
  children: string[];
  isCollapsed: boolean;
  type: 'text' | 'query' | 'dispatch';
  result?: any;
  lastRun?: string;
  isLoading?: boolean;
  error?: string;
  metadata?: {
    charLimit: number;
    splitDirection?: 'vertical' | 'horizontal';
  };
}

export interface PanelConfig {
  id: string;
  type: 'editor' | 'terminal' | 'graph' | 'context';
  title: string;
  activeBlockId?: string;
}