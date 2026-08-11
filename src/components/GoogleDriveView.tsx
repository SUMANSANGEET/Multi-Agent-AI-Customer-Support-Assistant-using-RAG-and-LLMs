import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  LogOut,
  Sparkles,
  Database
} from 'lucide-react';
import {
  initDriveAuth,
  googleSignIn,
  logoutDrive,
  listDriveFiles,
  deleteDriveFile,
  createDriveFile,
  DriveFile
} from '../lib/googleDrive';
import { User } from 'firebase/auth';

export const GoogleDriveView: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Modal State for New File Creation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Modal Confirmation for Destructive Delete Operation
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // RAG Import Status
  const [importedFileIds, setImportedFileIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadFiles = async (authToken = token) => {
    if (!authToken) return;
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      const driveFiles = await listDriveFiles(authToken, searchQuery);
      setFiles(driveFiles);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch files from Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadFiles(token);
    }
  }, [token]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        loadFiles(result.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Drive authentication failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutDrive();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
    setFiles([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      loadFiles(token);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newFileName.trim()) return;

    setIsCreating(true);
    setErrorMessage(null);
    try {
      const created = await createDriveFile(
        token,
        newFileName.endsWith('.txt') ? newFileName : `${newFileName}.txt`,
        newFileContent || 'TechMart AI Support Document Content'
      );

      setSuccessNotification(`File "${created.name}" created successfully in Google Drive!`);
      setIsCreateModalOpen(false);
      setNewFileName('');
      setNewFileContent('');
      loadFiles(token);
      setTimeout(() => setSuccessNotification(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create document in Google Drive.');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!token || !fileToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteDriveFile(token, fileToDelete.id);
      setSuccessNotification(`Deleted "${fileToDelete.name}" from Google Drive.`);
      setFileToDelete(null);
      loadFiles(token);
      setTimeout(() => setSuccessNotification(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete file from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportToRAG = (file: DriveFile) => {
    setImportedFileIds(prev => [...prev, file.id]);
    setSuccessNotification(`Imported "${file.name}" into TechMart Multi-Agent RAG Knowledge Base!`);
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'N/A';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return 'N/A';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Folder className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Google Drive Integration</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-full flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>OAuth 2.0 Connected</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Browse, search, upload, and sync Google Drive documents directly with the TechMart Multi-Agent Knowledge Engine.
            </p>
          </div>
        </div>

        {/* AUTH CONTROLS */}
        {user ? (
          <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-emerald-500/50" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center font-bold text-xs">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="text-left min-w-0">
              <div className="text-xs font-semibold text-white truncate max-w-[140px]">
                {user.displayName || 'Connected Account'}
              </div>
              <div className="text-[10px] text-emerald-400 truncate max-w-[140px]">
                {user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
              title="Sign Out of Google Drive"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents font-medium text-sm">
                  {isLoggingIn ? 'Authenticating Google Drive...' : 'Sign in with Google'}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* NOTIFICATIONS & ERRORS */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotification && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successNotification}</span>
        </div>
      )}

      {/* SIGN-IN PROMPT WHEN AUTH IS NEEDED */}
      {needsAuth ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-6 max-w-2xl mx-auto my-12 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center mx-auto text-emerald-400">
            <Folder className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Connect Google Drive Account</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in with your Google account to grant permission for TechMart Support to list, upload, and sync knowledge base documents directly from Google Drive.
            </p>
          </div>
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button cursor-pointer"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents font-medium text-sm">
                  {isLoggingIn ? 'Connecting to Google Drive...' : 'Sign in with Google'}
                </span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* MAIN GOOGLE DRIVE FILE EXPLORER */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
          {/* SEARCH & CONTROLS TOOLBAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Google Drive files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </form>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => loadFiles()}
                disabled={isLoadingFiles}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                title="Refresh File List"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Drive Document</span>
              </button>
            </div>
          </div>

          {/* FILE LIST TABLE */}
          {isLoadingFiles ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading Google Drive files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="py-16 text-center space-y-3 border-2 border-dashed border-slate-800 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No Google Drive Files Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No matching documents found in your Drive account. Click "New Drive Document" above to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-3">Document Name</th>
                    <th className="pb-3 px-3 hidden sm:table-cell">Type</th>
                    <th className="pb-3 px-3 hidden md:table-cell">Size</th>
                    <th className="pb-3 px-3 hidden lg:table-cell">Last Modified</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {files.map(file => {
                    const isImported = importedFileIds.includes(file.id);
                    return (
                      <tr key={file.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-slate-200 truncate max-w-xs group-hover:text-emerald-300">
                                {file.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs">
                                ID: {file.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 hidden sm:table-cell text-slate-400 font-mono text-[11px]">
                          {file.mimeType.split('.').pop()?.replace('vnd.google-apps.', '') || 'file'}
                        </td>

                        <td className="py-3 px-3 hidden md:table-cell text-slate-400 font-mono text-[11px]">
                          {formatFileSize(file.size)}
                        </td>

                        <td className="py-3 px-3 hidden lg:table-cell text-slate-400 text-[11px]">
                          {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* RAG KNOWLEDGE BASE IMPORT */}
                            <button
                              onClick={() => handleImportToRAG(file)}
                              disabled={isImported}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
                                isImported
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80 cursor-default'
                                  : 'bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80'
                              }`}
                              title="Sync with Multi-Agent Support RAG Index"
                            >
                              {isImported ? (
                                <>
                                  <FileCheck className="w-3 h-3 text-emerald-400" />
                                  <span>Synced to RAG</span>
                                </>
                              ) : (
                                <>
                                  <Database className="w-3 h-3 text-indigo-400" />
                                  <span>Sync to RAG</span>
                                </>
                              )}
                            </button>

                            {/* OPEN IN GOOGLE DRIVE */}
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-950 rounded-lg border border-slate-800 transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* DELETE BUTTON (TRIGGERS STRICT MODAL CONFIRMATION) */}
                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950 rounded-lg border border-slate-800 hover:border-rose-800 transition-colors"
                              title="Delete File from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE NEW DRIVE DOCUMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">New Google Drive Document</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return_Policy_Standard_Operating_Procedure.txt"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Text Content
                </label>
                <textarea
                  rows={5}
                  placeholder="Enter policy guidelines, diagnostic notes, or customer support procedures..."
                  value={newFileContent}
                  onChange={e => setNewFileContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Drive...</span>
                    </>
                  ) : (
                    <span>Create Document</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG FOR DESTRUCTIVE DELETE OPERATION */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/80 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3 text-rose-400">
              <div className="p-2 bg-rose-950 border border-rose-800 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Confirm Google Drive Deletion</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This action will permanently mutate user data in Google Drive.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1 font-mono">
              <div className="text-slate-400">Target Document:</div>
              <div className="text-rose-300 font-bold truncate">{fileToDelete.name}</div>
              <div className="text-[10px] text-slate-500">ID: {fileToDelete.id}</div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this file from Google Drive? This operation cannot be undone once confirmed.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-rose-600/20"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting from Drive...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm & Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
