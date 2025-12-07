import React, { useState, useRef, useEffect } from 'react';
import { BlockData } from '../types';
import { CornerDownRight, BoxSelect, Play, Loader2, AlertTriangle } from 'lucide-react';

interface BlockProps {
  block: BlockData;
  depth: number;
  onUpdate: (id: string, content: string) => void;
  onSplit: (id: string) => void;
  onThread: (id: string) => void;
  onExecute?: () => void;
  isFocused?: boolean;
}

const Block: React.FC<BlockProps> = ({ block, depth, onUpdate, onSplit, onThread, onExecute, isFocused }) => {
  const [content, setContent] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(block.content.length);
  const limit = block.metadata?.charLimit || 500;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  useEffect(() => {
    if(isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= limit) {
      setContent(val);
      setCharCount(val.length);
      onUpdate(block.id, val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      onThread(block.id);
    }
  };

  // Regex to highlight [[wikilinks]] and [tags]
  const renderHighlightedContent = () => {
    const parts = content.split(/(\[\[.*?\]\]|\[.*?\]|\{.*?\})/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        return <span key={i} className="text-neon-cyan font-bold cursor-pointer hover:underline">{part}</span>;
      }
      if (part.startsWith('[') && part.endsWith(']')) {
        return <span key={i} className="text-neon-amber font-semibold">{part}</span>;
      }
      if (part.startsWith('{') && part.endsWith('}')) {
        return <span key={i} className="text-neon-pink font-semibold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const isQuery = block.type === 'query';
  const isDispatch = block.type === 'dispatch';
  const isActionable = isQuery || isDispatch;

  return (
    <div className={`
      relative group mb-4 transition-all duration-300
      border-l-2 border-surface-800 hover:border-neon-cyan
      pl-4 ml-${depth > 0 ? 4 : 0}
    `}>
      {/* Block Header / Tools */}
      <div className="flex items-center justify-between mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-2 text-xs text-gray-500 font-tech">
          <span className="text-neon-cyan">UID::{block.id.slice(0, 4)}</span>
          <span>CTX::{depth}</span>
          {isDispatch && <span className="text-neon-green ml-2">[DISPATCH]</span>}
          {block.isLoading && <span className="text-neon-pink ml-2 animate-pulse">[COMPILING...]</span>}
        </div>
        <div className="flex items-center space-x-2">
          {isActionable && (
            <button 
              onClick={onExecute} 
              disabled={block.isLoading}
              className={`p-1 mr-2 flex items-center gap-1 text-[10px] font-bold border border-zinc-700 bg-surface-800 hover:border-neon-green hover:text-neon-green transition-colors ${block.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {block.isLoading ? <Loader2 size={10} className="animate-spin"/> : <Play size={10} />}
              EXECUTE
            </button>
          )}
          <button onClick={() => onSplit(block.id)} className="p-1 hover:text-neon-pink" title="Split Horizontal"><BoxSelect size={12} /></button>
          <button onClick={() => onThread(block.id)} className="p-1 hover:text-neon-green" title="Thread Vertical"><CornerDownRight size={12} /></button>
        </div>
      </div>

      {/* Main Editor Surface */}
      <div className={`
        relative bg-surface-900 border border-zinc-800 p-3 
        shadow-[0_0_10px_rgba(0,0,0,0.5)]
        transition-colors duration-500
        ${isQuery ? (block.isLoading ? 'border-l-4 border-l-neon-pink animate-pulse' : 'border-l-4 border-l-neon-pink') : ''}
        ${isDispatch ? (block.isLoading ? 'border-l-4 border-l-neon-green animate-pulse' : 'border-l-4 border-l-neon-green') : ''}
      `}>
        {/* Rendered Overlay for Highlighting (Pointer events none allows clicking through to textarea) */}
        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none absolute inset-0 p-3 text-transparent z-10">
          {renderHighlightedContent()}
        </div>

        {/* Actual Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={block.isLoading}
          className={`
            w-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed
            ${isQuery ? 'text-neon-pink' : isDispatch ? 'text-neon-green' : 'text-gray-300'}
            placeholder-gray-700 block
            ${block.isLoading ? 'opacity-50' : 'opacity-100'}
          `}
          spellCheck={false}
          placeholder={isQuery ? "Enter query..." : isDispatch ? "Enter dispatch command..." : "Enter thought block..."}
        />
        
        {/* Health Bar (Char Count) */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-surface-800 w-full">
           <div 
             className={`h-full transition-all duration-300 ${charCount > limit * 0.9 ? 'bg-red-500' : 'bg-neon-cyan'}`} 
             style={{ width: `${(charCount / limit) * 100}%` }}
           />
        </div>
      </div>

      {/* Execution Results Area */}
      {block.error && (
        <div className="mt-2 p-2 border border-red-900/50 bg-red-900/10 text-red-400 text-xs font-mono flex gap-2 items-start">
           <AlertTriangle size={14} className="mt-0.5 shrink-0" />
           <div>
             <div className="font-bold">EXECUTION_FAILURE</div>
             {block.error}
           </div>
        </div>
      )}

      {block.result && (
        <div className="mt-2 border-t-2 border-dashed border-zinc-800 pt-2 animate-in fade-in slide-in-from-top-2">
           <div className="flex justify-between text-[10px] text-gray-500 font-tech mb-1">
              <span>RETURN_VALUE</span>
              <span>TIME::{block.lastRun}</span>
           </div>
           <pre className="text-xs text-gray-400 bg-black p-2 overflow-x-auto border border-zinc-900 custom-scrollbar max-h-60">
             {JSON.stringify(block.result, null, 2)}
           </pre>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex justify-between items-center mt-1">
         <div className="text-[10px] font-tech text-gray-600">
            MEM::{(charCount / limit * 100).toFixed(1)}% 
         </div>
      </div>
    </div>
  );
};

export default Block;