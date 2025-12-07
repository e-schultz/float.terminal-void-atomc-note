import React from 'react';
import { Node, Edge } from '../types';
import { Share2, Network, Database, Layers } from 'lucide-react';

interface HauntSidebarProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (nodeId: string) => void;
}

const HauntSidebar: React.FC<HauntSidebarProps> = ({ nodes, edges, onNodeClick }) => {
  return (
    <div className="h-full flex flex-col bg-void border-l border-zinc-800 text-xs font-mono overflow-y-auto">
      <div className="p-3 border-b border-zinc-800 bg-surface-900 sticky top-0 z-20">
        <h3 className="text-neon-green font-bold flex items-center gap-2">
          <Network size={14} /> 
          SYSTEM_CTX::ACTIVE
        </h3>
        <div className="flex gap-4 mt-2 text-[10px] text-gray-500 font-tech">
          <span>NODES::{nodes.length}</span>
          <span>EDGES::{edges.length}</span>
          <span>LATENCY::0.2ms</span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Marker Cloud */}
        <div>
          <h4 className="text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Share2 size={10} /> Marker Index
          </h4>
          <div className="flex flex-wrap gap-2">
            {['{ref::core}', '{ctx::sys}', '{evt::input}', '[dispatch]', '((null))'].map((marker, i) => (
              <span key={i} className="px-1.5 py-0.5 border border-zinc-800 text-neon-pink bg-surface-900 hover:border-neon-cyan cursor-pointer transition-colors">
                {marker}
              </span>
            ))}
          </div>
        </div>

        {/* Node List (Flat) */}
        <div>
           <h4 className="text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Database size={10} /> Reference Nodes
          </h4>
          <div className="space-y-2">
            {nodes.map(node => (
              <div 
                key={node.id} 
                onClick={() => onNodeClick(node.id)}
                className="group p-2 border border-zinc-900 bg-surface-900 hover:border-neon-cyan hover:shadow-[0_0_8px_rgba(0,240,255,0.2)] cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-neon-cyan font-bold truncate pr-2">{node.title}</span>
                  <span className="text-[9px] text-gray-600 bg-black px-1 border border-zinc-800">{node.id.slice(0,6)}</span>
                </div>
                {node.description && (
                  <p className="text-gray-400 line-clamp-2 leading-tight text-[10px]">{node.description}</p>
                )}
                {node.tags && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {node.tags.slice(0,3).map(t => <span key={t} className="text-[9px] text-neon-amber">#{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Tech Decor */}
        <div className="text-gray-700 text-[8px] leading-[8px] select-none opacity-50 font-tech whitespace-pre mt-8 border-t border-zinc-900 pt-4">
          SYSTEM.READY<br/>
          MEM_ALLOC: OK<br/>
          BUFFER: FLUSHED<br/>
        </div>

      </div>
    </div>
  );
};

export default HauntSidebar;