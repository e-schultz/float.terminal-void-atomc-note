import { FloatQLData, BlockData } from './types';

export const INITIAL_AST: FloatQLData = {
  "meta": {
    "title": "FLOAT AST: State Management Analysis",
    "uid": "dispatch::20250518_sys_core",
    "date": "2025-05-18",
    "status": "active",
    "tags": ["float-core", "system-arch", "redux", "state-machines", "graph", "ast"],
    "marker": ["{ref::core}", "{ctx::sys}"],
    "imprint": "tech.core.v1",
    "destination": "local.store",
    "author": "system",
    "size": "12KB"
  },
  "nodes": [
    {
      "id": "root",
      "title": "System Root: State Graph v1.0",
      "marker": "{ctx::sys}",
      "type": "note",
      "timestamp": "2025-05-18T00:00",
      "description": "Root node for the recursive state analysis. Tracks the transformation of unstructured input into structured graph data.",
      "tags": ["core"],
      "annotations": [
        {
          "type": "concept",
          "content": "Recursive structure definition",
          "marker": "{ref::arch}"
        },
        {
          "type": "ctx",
          "content": "system_core",
          "marker": "{ctx::sys}"
        }
      ],
      "children": ["init-event", "transform-logic", "output-dispatch"]
    },
    {
      "id": "init-event",
      "parentId": "root",
      "title": "Initial Input Event",
      "marker": "{evt::input}",
      "type": "event",
      "timestamp": "2025-05-18T00:00",
      "description": "Raw data ingestion point. Analogous to a Redux Action being dispatched. Payload contains unstructured text.",
      "themes": ["Input", "Ingestion", "Raw Data"],
      "tags": ["system", "io"],
      "annotations": [
        {
          "type": "event",
          "content": "Data entry point",
          "marker": "{ref::entry}"
        }
      ],
      "children": []
    },
    {
      "id": "transform-logic",
      "parentId": "root",
      "title": "Transformation Logic",
      "marker": "{func::reduce}",
      "type": "function",
      "timestamp": "2025-05-18T00:05",
      "description": "The reducer mechanism. Takes raw input and current state, applies schema validation, and outputs a new state tree.",
      "themes": ["Reducer", "Pure Function", "Immutability"],
      "tags": ["logic", "core"],
      "annotations": [
        {
          "type": "logic",
          "content": "State reduction process",
          "marker": "{ref::logic}"
        }
      ],
      "reduxMapping": {
        "input": "action payload",
        "process": "reducer",
        "output": "new store state"
      },
      "children": []
    },
    {
      "id": "output-dispatch",
      "parentId": "root",
      "title": "Output Dispatch",
      "marker": "{io::write}",
      "type": "io",
      "timestamp": "2025-05-18T00:10",
      "description": "Final commit to the database. Triggers side effects (UI updates, API calls).",
      "themes": ["Commit", "Side Effects", "Persistence"],
      "tags": ["io", "db"],
      "annotations": [
        {
          "type": "io",
          "content": "Database commit",
          "marker": "{ref::commit}"
        }
      ],
      "children": []
    }
  ],
  "edges": [
    {"from": "root", "to": "init-event", "type": "parent-child"},
    {"from": "root", "to": "transform-logic", "type": "parent-child"},
    {"from": "transform-logic", "to": "output-dispatch", "type": "sequential"}
  ]
};

export const INITIAL_BLOCKS: Record<string, BlockData> = {
  "root": {
    id: "root",
    content: "[[FLOAT.terminal]] system ready.\n\n> system.init(core)\n\nAtomic editor initialized. \nInput stream active. Waiting for command...",
    parentId: null,
    children: ["b1", "b2", "b3", "b4"],
    isCollapsed: false,
    type: "text",
    metadata: { charLimit: 500 }
  },
  "b1": {
    id: "b1",
    content: "Block storage is flat-file based.\nReferences are handled via UID.\n\n[tag::db] [tag::arch]",
    parentId: "root",
    children: [],
    isCollapsed: false,
    type: "text",
    metadata: { charLimit: 500 }
  },
  "b2": {
    id: "b2",
    content: "query {\n  nodes(filter: { marker: \"{ctx::sys}\" }) {\n    id\n    title\n  }\n}",
    parentId: "root",
    children: [],
    isCollapsed: false,
    type: "query",
    metadata: { charLimit: 1000 }
  },
  "b3": {
    id: "b3",
    content: "float.dispatch({\n  target: \"system.log\",\n  level: \"info\",\n  message: \"System check complete\"\n})",
    parentId: "root",
    children: [],
    isCollapsed: false,
    type: "dispatch",
    metadata: { charLimit: 500 }
  },
  "b4": {
    id: "b4",
    content: "query {\n  trace(process: \"state_reduction\") {\n    input {\n      raw_payload\n    }\n    transform {\n      schema_validation\n    }\n    output {\n      db_commit\n    }\n  }\n}",
    parentId: "root",
    children: [],
    isCollapsed: false,
    type: "query",
    metadata: { charLimit: 1000 }
  }
};