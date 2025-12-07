# System Architecture // FLOAT.terminal

## Overview

FLOAT.terminal is a React-based Single Page Application (SPA). It abandons the traditional "document model" (one long string of text) in favor of a **Graph-based Block Model**. Every piece of content is an object with a unique ID, content string, and a list of child IDs.

## 📂 Directory Structure

```
/src
├── index.tsx            # Entry point
├── App.tsx              # Main Controller & State Container
├── types.ts             # TypeScript Interfaces (Nodes, Blocks, Edges)
├── constants.ts         # Initial Data (The "Database" & Default Blocks)
├── components/
│   ├── Block.tsx        # Atomic Editor Component
│   └── HauntSidebar.tsx # Knowledge Graph Visualizer
└── index.html           # Tailwind Config & Global Styles
```

## 🏗️ Core Concepts

### 1. The Block Model (Flat State, Recursive Render)
While the UI looks like a nested tree, the data is stored flat for performance and easier lookups.

**Data Structure:**
```typescript
type BlockData = {
  id: string;
  content: string;
  children: string[]; // Array of child IDs
  type: 'text' | 'query' | 'dispatch';
  // ...
}
```
**Rendering:**
`App.tsx` contains a `renderBlockTree` function. It takes a `blockId`, renders that block, and then recursively calls itself for every ID found in that block's `children` array.

### 2. System Context (The "AST")
The application simulates a backend connection via `activeNodes` (defined in `constants.ts`). This represents the "Abstract Syntax Tree" or knowledge graph of the system.
*   **Visualizer:** `HauntSidebar.tsx` renders this data.
*   **Interaction:** Clicking a node "injects" a reference block into the main editor stream, simulating a retrieval-augmented workflow.

### 3. "Fuzzy Compiling" (LLM Integration)
The "Query" feature is a novel architectural choice. Instead of writing a rigid parser for a specific query language (like GraphQL or SQL), the app offloads interpretation to an LLM.

**The Flow:**
1.  User types a vague query into a `Block` (e.g., "Show me the init events").
2.  User clicks **EXECUTE**.
3.  `App.tsx` packages two things:
    *   The **Context**: A JSON string of `activeNodes`.
    *   The **Query**: The text content of the block.
4.  This payload is sent to **Google Gemini (v2.5-flash)**.
5.  Gemini acts as the "Engine," filtering the JSON based on the natural language request.
6.  The result is returned and stored in the Block's `result` state.

## 🎨 Styling Architecture
*   **Tailwind CSS**: Used for layout, spacing, and utility classes.
*   **Theming**: A custom `tailwind.config` in `index.html` defines the `neon` color palette and `void` backgrounds.
*   **CRT Overlay**: A CSS-only layer using `pointer-events-none` sits on top of the app (z-index 50) to apply scanlines and vignette effects without blocking clicks.

## 🔄 Data Flow

1.  **User Input** -> `Block.tsx` (Local State) -> `onChange` -> `App.tsx` (Global Store Update).
2.  **Threading** -> `App.tsx` generates new UUID -> Updates Parent Block's `children` array -> Re-renders Tree.
3.  **Execution** -> `App.tsx` sets `isLoading` -> Async API Call -> Updates Block `result` -> UI displays JSON.
