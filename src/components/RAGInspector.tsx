import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  FileText,
  Plus,
  Sparkles,
  CheckCircle,
  FileCode,
  Layers,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { KBDocument, VectorChunk, RetrievalResult } from '../types';

export const RAGInspector: React.FC = () => {
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null);

  // Search Playground state
  const [searchQuery, setSearchQuery] = useState('How do I return my laptop or request a refund within 30 days?');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchResults, setSearchResults] = useState<RetrievalResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Add Chunk Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<any>('Billing');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetchDocuments();
    handleSearch();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/rag/documents');
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
        if (data.documents.length > 0) {
          setSelectedDoc(data.documents[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch documents:', e);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          topK: 5,
          categoryFilter
        })
      });
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.warn('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddChunk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    try {
      await fetch('/api/rag/add-chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docTitle: newTitle,
          category: newCategory,
          content: newContent
        })
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewContent('');
      handleSearch();
    } catch (e) {
      console.warn('Add chunk error:', e);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
            <Database className="w-5 h-5" />
            <span>Retrieval-Augmented Generation (RAG)</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Vector Database & Knowledge Base Engine</h2>
          <p className="text-xs text-slate-400">
            Inspect ingested company PDF/MD documents, test cosine similarity vector retrieval, and insert new knowledge chunks.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Chunk</span>
        </button>
      </div>

      {/* SEMANTIC VECTOR SEARCH PLAYGROUND */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base text-white flex items-center space-x-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Semantic Vector Similarity Search Playground</span>
          </h3>
          <span className="text-xs text-slate-400">Gemini Embedding 2 / Dense Vector Test</span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type query to retrieve vector chunks (e.g., 'What is the return policy for defective laptops?')..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Product">Product</option>
              <option value="Complaint">Complaint</option>
              <option value="FAQ">FAQ</option>
            </select>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 shrink-0"
            >
              {isSearching ? 'Searching...' : 'Search Vector Store'}
            </button>
          </div>

          {/* SEARCH RESULTS DISPLAY */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Top Retrieved Vector Chunks ({searchResults.length}):
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-xl text-center text-xs text-slate-500">
                No vector chunks match the query criteria.
              </div>
            ) : (
              searchResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950 border border-slate-800/90 rounded-xl space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{res.chunk.docTitle}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                        {res.chunk.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-400">Cosine Similarity:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {Math.round(res.similarityScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Similarity Progress Bar */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(res.similarityScore * 100)}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                    {res.chunk.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* KNOWLEDGE BASE DOCUMENTS BROWSER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-semibold text-sm text-white flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Ingested Documents ({documents.length})</span>
          </h3>

          <div className="space-y-2">
            {documents.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/80 text-white'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold truncate mb-0.5">{doc.title}</div>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                      <span>{doc.filename}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{doc.chunkCount} Chunks</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 text-slate-500" />
                </button>
              );
            })}
          </div>
        </div>

        {/* DOCUMENT PREVIEW */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 flex flex-col">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-base text-white">{selectedDoc.title}</h4>
                  <p className="text-xs text-slate-400">
                    Category: <strong className="text-indigo-400">{selectedDoc.category}</strong> • Last Updated: {selectedDoc.lastUpdated}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-mono font-bold">
                  {selectedDoc.filename}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-96 whitespace-pre-wrap">
                {selectedDoc.content}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Select a document to inspect text content.
            </div>
          )}
        </div>
      </div>

      {/* ADD CHUNK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white">Add Custom Knowledge Chunk</h3>

            <form onSubmit={handleAddChunk} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Holiday Shipping Extended Return Policy"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="Billing">Billing</option>
                  <option value="Technical">Technical</option>
                  <option value="Product">Product</option>
                  <option value="Complaint">Complaint</option>
                  <option value="FAQ">FAQ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Text Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste policy or guide text to embed into vector index..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Save & Index Vector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
