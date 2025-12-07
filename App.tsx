import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_AST, INITIAL_BLOCKS } from './constants';
import { BlockData, Node } from './types';
import Block from './components/Block';
import HauntSidebar from './components/HauntSidebar';
import { Terminal, Cpu, Layout, Command, Mic, Settings, Search, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const generateBlockTemplate = (type: 'text' | 'query' | 'dispatch'): string => {
  switch (type) {
    case 'query':
      return `// Enter natural language or pseudo-code query
query {
  nodes(filter: { tags: ["core"] }) {
    id
    title
  }
}`;
    case 'dispatch':
      return `// Dispatch system event or action
float.dispatch({
  target: "system.log",
  payload: { 
    event: "manual_trigger",
    priority: "high"
  }
})`;
    case 'text':
    default:
      return '';
  }
};

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<Record<string, BlockData>>(INITIAL_BLOCKS);
  const [activeNodes, setActiveNodes] = useState<Node[]>(INITIAL_AST.nodes);
  const [commandInput, setCommandInput] = useState('');
  const [leftPanelIds, setLeftPanelIds] = useState<string[]>(['root']);
  const [bootSequence, setBootSequence] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fake boot sequence
  useEffect(() => {
    const timer = setTimeout(() => setBootSequence(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const updateBlock = (id: string, content: string) => {
    setBlocks(prev => ({
      ...prev,
      [id]: { ...prev[id], content }
    }));
  };

  const executeBlock = async (id: string) => {
    const block = blocks[id];
    if (!block) return;

    // Set Loading State
    setBlocks(prev => ({
      ...prev,
      [id]: { ...prev[id], isLoading: true, error: undefined, result: undefined }
    }));

    try {
      // Initialize Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct the Contextual Prompt
      // We pass the AST nodes as the "Database" and the block content as the "Query"
      const systemContext = JSON.stringify(activeNodes);
      
      const prompt = `
        You are the Query Engine for FLOAT.terminal.
        
        SYSTEM_CONTEXT (JSON Database):
        ${systemContext}
        
        USER_QUERY (Fuzzy/Pseudo-code):
        ${block.content}
        
        INSTRUCTIONS:
        1. Interpret the USER_QUERY. It might be GraphQL, specific keywords, or natural language.
        2. Filter, transform, or select data from the SYSTEM_CONTEXT based on the query.
        3. If the query implies a "dispatch" or action, return a confirmation object.
        4. Return ONLY valid JSON representing the result. Do not include markdown formatting.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const resultText = response.text;
      
      let parsedResult;
      try {
        parsedResult = JSON.parse(resultText || '{}');
      } catch (e) {
        parsedResult = { error: "PARSE_FAILURE", raw: resultText };
      }

      setBlocks(prev => ({
        ...prev,
        [id]: { 
          ...prev[id], 
          isLoading: false, 
          result: parsedResult,
          lastRun: new Date().toLocaleTimeString()
        }
      }));

    } catch (error) {
      console.error("Execution failed:", error);
      setBlocks(prev => ({
        ...prev,
        [id]: { 
          ...prev[id], 
          isLoading: false, 
          error: "CORE_CONNECTION_FAILED" 
        }
      }));
    }
  };

  const threadBlock = (parentId: string, type: 'text' | 'query' | 'dispatch' = 'text') => {
    const newId = `b${Date.now().toString(36)}`;
    const newBlock: BlockData = {
      id: newId,
      content: generateBlockTemplate(type),
      parentId,
      children: [],
      isCollapsed: false,
      type: type,
      metadata: { charLimit: type === 'query' ? 1000 : 500 }
    };

    setBlocks(prev => {
      const parent = prev[parentId];
      return {
        ...prev,
        [parentId]: { ...parent, children: [...parent.children, newId] },
        [newId]: newBlock
      };
    });
  };

  const splitBlock = (id: string) => {
    // In this MVP, split just adds to the root panel list for simplicity
    // Ideally it would create a parallel column
    console.log("Split requested for", id);
  };

  const handleContextInject = (nodeId: string) => {
    // Inject the node content into a new block
    const node = activeNodes.find(n => n.id === nodeId);
    if (!node) return;

    const newId = `ctx-${nodeId}-${Date.now()}`;
    const newBlock: BlockData = {
      id: newId,
      content: `[[${node.title}]]\n${node.description || ''}\n\n[marker::${node.marker || 'null'}]`,
      parentId: 'root',
      children: [],
      isCollapsed: false,
      type: 'text',
      metadata: { charLimit: 1000 }
    };

     setBlocks(prev => {
      const root = prev['root'];
      return {
        ...prev,
        'root': { ...root, children: [newId, ...root.children] },
        [newId]: newBlock
      };
    });
  };

  // Filter blocks for search
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return Object.values(blocks).filter((block: BlockData) => 
      block.id !== 'root' && 
      (block.content.toLowerCase().includes(query) || 
       block.id.toLowerCase().includes(query))
    );
  }, [blocks, searchQuery]);

  // Recursively render blocks
  const renderBlockTree = (blockId: string, depth: number = 0) => {
    const block = blocks[blockId];
    if (!block) return null;

    return (
      <div key={blockId}>
        <Block 
          block={block} 
          depth={depth} 
          onUpdate={updateBlock} 
          onSplit={splitBlock} 
          onThread={(id) => threadBlock(id)} 
          onExecute={() => executeBlock(blockId)}
        />
        <div className="border-l border-dashed border-gray-800 ml-4">
          {block.children.map(childId => renderBlockTree(childId, depth + 1))}
        </div>
      </div>
    );
  };

  if (bootSequence) {
    return (
      <div className="h-screen w-screen bg-void flex items-center justify-center font-tech text-neon-cyan flex-col">
        <div className="animate-pulse-fast text-4xl mb-4">FLOAT.terminal</div>
        <div className="text-xs text-neon-pink">INITIALIZING KNOWLEDGE GRAPH...</div>
        <div className="w-64 h-1 bg-surface-800 mt-4 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-neon-green animate-[scanline_2s_linear_infinite] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-void flex flex-col font-mono relative overflow-hidden">
      {/* CRT Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none crt-overlay z-50 opacity-20" />
      
      {/* Top Bar */}
      <header className="h-10 border-b border-zinc-800 bg-surface-900 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-4">
           <div className="font-bold text-neon-cyan tracking-widest text-lg">FLOAT</div>
           <div className="h-4 w-[1px] bg-zinc-700" />
           <div className="text-xs text-gray-500 font-tech">SESSION::2025-05-18</div>
           <div className="text-xs text-neon-pink font-tech animate-pulse">STATUS::LIVE</div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-600 group-focus-within:text-neon-cyan transition-colors">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH_BLOCKS :: [content | uid]"
            className="w-full bg-surface-800 border border-zinc-700 text-xs font-mono py-1.5 pl-9 pr-8 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all rounded-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-neon-pink"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex gap-4 text-gray-400">
           <Layout size={16} className="hover:text-neon-cyan cursor-pointer" />
           <Settings size={16} className="hover:text-neon-cyan cursor-pointer" />
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: The Block Editor (The "Twitter-like" stream) */}
        <main className="flex-1 flex flex-col min-w-0 bg-void relative">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-3xl mx-auto pb-32">
               
               {searchQuery ? (
                 // Search Results View
                 <div className="space-y-4 mt-4">
                    <div className="text-xs font-tech text-gray-500 mb-6 flex justify-between border-b border-zinc-800 pb-2">
                       <span>SEARCH_RESULTS :: "{searchQuery}"</span>
                       <span>COUNT :: {filteredBlocks.length}</span>
                    </div>
                    {filteredBlocks.length > 0 ? (
                      filteredBlocks.map(block => (
                        <div key={block.id}>
                          <Block 
                            block={block} 
                            depth={0} 
                            onUpdate={updateBlock} 
                            onSplit={splitBlock} 
                            onThread={(id) => threadBlock(id)} 
                            onExecute={() => executeBlock(block.id)}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-600 font-tech mt-12">
                         <p className="mb-2">VOID_RETURNED_NULL</p>
                         <p className="text-[10px]">No blocks found matching query signature.</p>
                      </div>
                    )}
                 </div>
               ) : (
                 // Tree View
                 <>
                   {blocks['root'].children.map(childId => renderBlockTree(childId))}
                   
                   {/* Empty State Prompt */}
                   <div className="mt-8 flex gap-4">
                     <div 
                       onClick={() => threadBlock('root', 'text')}
                       className="flex-1 border-2 border-dashed border-zinc-800 p-4 text-center text-gray-600 hover:border-neon-cyan hover:text-neon-cyan cursor-pointer transition-colors"
                     >
                       + ADD_BLOCK [text]
                     </div>
                     <div 
                       onClick={() => threadBlock('root', 'query')}
                       className="flex-1 border-2 border-dashed border-zinc-800 p-4 text-center text-gray-600 hover:border-neon-pink hover:text-neon-pink cursor-pointer transition-colors"
                     >
                       + ADD_QUERY [graph]
                     </div>
                     <div 
                       onClick={() => threadBlock('root', 'dispatch')}
                       className="flex-1 border-2 border-dashed border-zinc-800 p-4 text-center text-gray-600 hover:border-neon-green hover:text-neon-green cursor-pointer transition-colors"
                     >
                       + ADD_DISPATCH [cmd]
                     </div>
                   </div>
                 </>
               )}

            </div>
          </div>
          
          {/* CLI / Command Bar */}
          <div className="h-12 border-t border-zinc-800 bg-surface-900 flex items-center px-4 gap-2 z-40">
            <Terminal size={16} className="text-neon-amber" />
            <input 
              type="text" 
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Enter system command..."
              className="bg-transparent border-none outline-none text-neon-amber w-full font-tech text-sm placeholder-zinc-700"
            />
            <div className="text-[10px] text-gray-600 font-tech border border-zinc-800 px-2 py-0.5">CMD_MODE</div>
          </div>
        </main>

        {/* Right: The Context (System Graph) */}
        <aside className="w-80 hidden md:flex flex-col border-l border-zinc-800 z-30 shadow-2xl">
          <HauntSidebar 
            nodes={activeNodes} 
            edges={INITIAL_AST.edges} 
            onNodeClick={handleContextInject}
          />
        </aside>

      </div>
      
      {/* Decorative Status Footer */}
      <footer className="h-6 bg-black border-t border-zinc-900 flex items-center justify-between px-2 text-[10px] text-gray-600 font-tech z-50 select-none">
         <div className="flex gap-4">
           <span>RAM::14%</span>
           <span>CPU::2%</span>
           <span className="text-neon-green">DAEMON::RUNNING</span>
         </div>
         <div className="flex gap-4">
            <span>Ln 42, Col 12</span>
            <span>UTF-8</span>
            <span>FLOAT_OS v1.0.0</span>
         </div>
      </footer>
    </div>
  );
};

export default App;