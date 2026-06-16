import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { StatsCard } from '../components/dashboard/StatsCard';
import { MessageList } from '../components/chat/MessageList';
import { InputBox } from '../components/chat/InputBox';
import { chatService } from '../services/chatService';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Terminal, 
  Sparkles, 
  HelpCircle, 
  Settings, 
  Cpu, 
  Link, 
  Map, 
  CheckSquare, 
  BookOpen, 
  Search,
  Code,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  // Navigation & General UI state
  const [activeTab, setActiveTab] = useState('loader');
  const [repoName, setRepoName] = useState('shivani07-gh/ask-your-repo');
  const [currentRepo, setCurrentRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [logs, setLogs] = useState([]);

  // Fetch user repos state
  const [githubUsername, setGithubUsername] = useState('');
  const [userRepos, setUserRepos] = useState([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);

  // Chat tab state
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // File Explorer state
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});

  // Architecture tab state
  const [architecture, setArchitecture] = useState(null);

  // Learning Roadmap tab state
  const [roadmap, setRoadmap] = useState('');
  const [completedRoadmapSteps, setCompletedRoadmapSteps] = useState({});

  // Dependencies tab state
  const [dependencies, setDependencies] = useState([]);
  const [depSearch, setDepSearch] = useState('');

  // Prompt Pills
  const promptPills = [
    'Explain the directory structure.',
    'Where is the main entry point?',
    'What files contain the FastAPI routes?',
    'Explain how the RAG model answers questions.'
  ];

  // Helper to add loading logs
  const addLog = (text) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  // 1. Load Repository
  const handleLoadRepo = async (targetRepo) => {
    const selectedRepo = targetRepo || repoName;
    if (!selectedRepo.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setLogs([]);
    addLog(`Initiating connection for: ${selectedRepo}`);
    
    try {
      addLog(`Sending fetch request to FastAPI backend...`);
      addLog(`Downloading file tree and repository contents via GitHub API...`);
      
      const response = await chatService.loadRepo(selectedRepo);
      addLog(response.message || 'Repository contents fetched successfully.');
      
      addLog(`Parsing modules and building semantic embeddings database...`);
      addLog(`Created vector DB store successfully.`);
      
      setCurrentRepo(selectedRepo);
      addLog(`Syncing file browser metadata...`);
      
      // Fetch files list for Explorer
      const filesResp = await chatService.getRepoFiles();
      setFiles(filesResp.files || []);
      
      addLog(`Successfully indexed ${filesResp.files?.length || 0} code files.`);
      
      // Pre-fetch architecture, dependencies, roadmap
      addLog(`Generating codebase architectural classification layers...`);
      const archResp = await chatService.getArchitecture();
      setArchitecture(archResp);
      
      addLog(`Analyzing dependency structures and module exports...`);
      const depResp = await chatService.getDependencies();
      setDependencies(depResp || []);
      
      addLog(`Sync complete! Ready to chat.`);
      setActiveTab('chat');
    } catch (err) {
      addLog(`[ERROR] Failed to load repository: ${err.message}`);
      setErrorMsg(err.message || 'Failed to ingest repository. Make sure the name is correct and token is valid.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch User Repos
  const handleFetchUserRepos = async () => {
    if (!githubUsername.trim()) return;
    setIsFetchingRepos(true);
    setErrorMsg('');
    try {
      const resp = await chatService.getUserRepos(githubUsername);
      setUserRepos(resp.repositories || []);
    } catch (err) {
      setErrorMsg(`Failed to fetch repositories for ${githubUsername}: ${err.message}`);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  // 3. Ask Question
  const handleSendMessage = async (text) => {
    if (!text.trim() || isChatLoading) return;
    
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);
    
    try {
      const resp = await chatService.askQuestion(text);
      const botMsg = {
        sender: 'bot',
        text: resp.answer || 'I could not find an answer for that.',
        sources: resp.sources || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: `Error: ${err.message}. Please try again.`
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 4. Generate Learning Roadmap
  const handleGenerateRoadmap = async () => {
    if (roadmap) return; // already loaded
    setIsLoading(true);
    try {
      const resp = await chatService.getRoadmap();
      setRoadmap(resp.roadmap || 'No learning roadmap could be generated.');
    } catch (err) {
      setErrorMsg(`Failed to generate roadmap: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Lifecycle to fetch roadmap when roadmap tab opens
  useEffect(() => {
    if (activeTab === 'roadmap' && currentRepo && !roadmap) {
      handleGenerateRoadmap();
    }
  }, [activeTab]);

  // Click on reference source inside chat switches tab and opens file
  const handleSourceClick = (filePath) => {
    const fileObj = files.find(f => f.path === filePath);
    if (fileObj) {
      setSelectedFile(fileObj);
      setActiveTab('explorer');
      
      // Expand necessary folders
      const parts = filePath.split('/');
      const folders = {};
      let pathAccum = '';
      for (let i = 0; i < parts.length - 1; i++) {
        pathAccum = pathAccum ? `${pathAccum}/${parts[i]}` : parts[i];
        folders[pathAccum] = true;
      }
      setExpandedFolders(prev => ({ ...prev, ...folders }));
    }
  };

  // Toggle folder open/close
  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Directory Tree builder helper
  const buildFileTree = () => {
    const root = { name: 'Root', isDir: true, path: '', children: {} };
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = root;
      let pathAccum = '';
      
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        pathAccum = pathAccum ? `${pathAccum}/${part}` : part;
        
        if (!current.children[part]) {
          current.children[part] = isLast
            ? { name: part, isDir: false, path: file.path, content: file.content }
            : { name: part, isDir: true, path: pathAccum, children: {} };
        }
        current = current.children[part];
      });
    });
    return root;
  };

  // Tree component rendering
  const renderTree = (node) => {
    const sortedKeys = Object.keys(node.children || {}).sort((a, b) => {
      const isDirA = node.children[a].isDir;
      const isDirB = node.children[b].isDir;
      if (isDirA && !isDirB) return -1;
      if (!isDirA && isDirB) return 1;
      return a.localeCompare(b);
    });

    return (
      <ul className="pl-4 space-y-1">
        {sortedKeys.map((key) => {
          const child = node.children[key];
          if (child.isDir) {
            const isOpen = !!expandedFolders[child.path];
            return (
              <li key={child.path} className="select-none">
                <div 
                  onClick={() => toggleFolder(child.path)}
                  className="flex items-center gap-1.5 py-1 px-2 hover:bg-[#f0edff]/50 text-slate-700 hover:text-[#5b4fcf] rounded-lg cursor-pointer text-xs font-semibold"
                >
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#7e7a9a]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#7e7a9a]" />}
                  <Folder className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">{child.name}</span>
                </div>
                {isOpen && renderTree(child)}
              </li>
            );
          } else {
            const isSelected = selectedFile?.path === child.path;
            return (
              <li key={child.path}>
                <div
                  onClick={() => setSelectedFile(child)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg cursor-pointer text-xs font-medium truncate ${
                    isSelected
                      ? 'bg-[#5b4fcf]/10 text-[#5b4fcf] font-bold border-l-2 border-[#5b4fcf]'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <File className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{child.name}</span>
                </div>
              </li>
            );
          }
        })}
      </ul>
    );
  };

  // Learning Roadmap parsing renderer
  const renderRoadmap = () => {
    if (!roadmap) return null;
    
    // Parse roadmap lines
    const lines = roadmap.split('\n');
    let currentStepNum = 0;

    return (
      <div className="space-y-4">
        {lines.map((line, idx) => {
          // Check for steps (typically numbered list items)
          const stepMatch = line.match(/^\d+\.\s+(.+)$/);
          if (stepMatch) {
            currentStepNum++;
            const stepText = stepMatch[1];
            const isCompleted = !!completedRoadmapSteps[currentStepNum];
            
            return (
              <div 
                key={idx}
                onClick={() => setCompletedRoadmapSteps(prev => ({ ...prev, [currentStepNum]: !isCompleted }))}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                  isCompleted 
                    ? 'bg-emerald-50/50 border-emerald-500/20 text-slate-500' 
                    : 'bg-white border-[#5b4fcf]/10 hover:border-[#5b4fcf]/30 hover:shadow-sm'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-600 text-white' 
                    : 'border-slate-300 bg-white'
                }`}>
                  {isCompleted && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-[#1c1a2e]'}`}>
                    Step {currentStepNum}: {stepText}
                  </div>
                </div>
              </div>
            );
          }

          // Render normal descriptions or bullet points
          if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
            return (
              <div key={idx} className="pl-12 text-xs text-[#7e7a9a] leading-relaxed flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#5b4fcf]/35 rounded-full flex-shrink-0"></span>
                <span>{line.replace(/^[-*]\s+/, '')}</span>
              </div>
            );
          }

          if (line.trim()) {
            return (
              <p key={idx} className="pl-12 text-xs text-[#7e7a9a] font-medium">
                {line}
              </p>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // Filter dependencies list
  const filteredDeps = dependencies.filter(dep => 
    dep.path?.toLowerCase().includes(depSearch.toLowerCase()) ||
    dep.file?.toLowerCase().includes(depSearch.toLowerCase()) ||
    dep.dependencies?.some(d => d.toLowerCase().includes(depSearch.toLowerCase()))
  );

  return (
    <div className="flex bg-[#faf9ff] min-h-screen text-[#1c1a2e] font-sans">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentRepo={currentRepo}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-[#5b4fcf]/10 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#1c1a2e] uppercase tracking-wide">
              Dashboard Workspace
            </span>
            {currentRepo && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#f0edff] text-[#5b4fcf] rounded-full text-xs font-mono font-bold">
                <Code className="w-3.5 h-3.5" />
                {currentRepo}
              </div>
            )}
          </div>
          
          {currentRepo && (
            <button
              onClick={() => setActiveTab('loader')}
              className="text-xs bg-[#f3f1fb] text-[#5b4fcf] hover:bg-[#5b4fcf] hover:text-white px-3 py-1.5 rounded-xl font-bold transition-all"
            >
              Change Repository
            </button>
          )}
        </header>

        {/* Dynamic Panels */}
        <div className="flex-1 overflow-y-auto min-h-0 relative">
          
          {/* TAB 1: Repo Loader panel */}
          {activeTab === 'loader' && (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-[#1c1a2e] tracking-tight">
                  Connect GitHub Repository
                </h1>
                <p className="text-sm text-[#7e7a9a]">
                  Enter a repository path or search your personal github account to populate the context embeddings database.
                </p>
              </div>

              {/* Form Input */}
              <div className="bg-white p-6 rounded-3xl border border-[#5b4fcf]/10 shadow-sm space-y-4">
                <label className="text-xs font-bold text-[#7e7a9a] uppercase tracking-wider block">
                  Repository Address (username/repo)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    disabled={isLoading}
                    placeholder="e.g. facebook/react"
                    className="flex-1 px-4 py-3 bg-[#f3f1fb]/50 focus:bg-[#f3f1fb] border border-[#5b4fcf]/10 focus:border-[#5b4fcf]/40 rounded-2xl text-sm focus:outline-none transition-all"
                  />
                  <button
                    onClick={() => handleLoadRepo()}
                    disabled={isLoading || !repoName.trim()}
                    className="bg-[#5b4fcf] hover:bg-[#483eb3] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-md shadow-[#5b4fcf]/15 active:scale-97 transition-all flex items-center gap-2"
                  >
                    {isLoading ? 'Loading...' : 'Ingest Repo'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Find User Repos block */}
              <div className="bg-white p-6 rounded-3xl border border-[#5b4fcf]/10 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-[#1c1a2e]">Import from GitHub Account</h3>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="GitHub Username (e.g. facebook)"
                      className="w-full pl-10 pr-4 py-3 bg-[#f3f1fb]/50 focus:bg-[#f3f1fb] border border-[#5b4fcf]/10 focus:border-[#5b4fcf]/40 rounded-2xl text-sm focus:outline-none transition-all"
                    />
                    <Search className="w-4 h-4 text-[#7e7a9a] absolute left-3.5 top-3.5" />
                  </div>
                  <button
                    onClick={handleFetchUserRepos}
                    disabled={isFetchingRepos || !githubUsername.trim()}
                    className="border-2 border-[#5b4fcf]/10 hover:border-[#5b4fcf]/25 bg-[#f0edff]/30 text-[#5b4fcf] px-5 py-3 rounded-2xl text-sm font-bold active:scale-97 transition-all"
                  >
                    {isFetchingRepos ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {userRepos.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pt-2">
                    {userRepos.map((repo) => (
                      <div
                        key={repo.full_name}
                        onClick={() => {
                          setRepoName(repo.full_name);
                          handleLoadRepo(repo.full_name);
                        }}
                        className="p-3 bg-slate-50 hover:bg-[#f0edff]/60 border border-slate-200 rounded-xl cursor-pointer transition-all flex justify-between items-center"
                      >
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#1c1a2e] truncate">{repo.name}</div>
                          <div className="text-[10px] text-[#7e7a9a] truncate font-mono">{repo.full_name}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5b4fcf] flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Console Logs Simulator */}
              {(logs.length > 0 || isLoading) && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4.5 h-4.5 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-slate-300">indexing_pipeline.log</span>
                    </div>
                    {isLoading && (
                      <span className="text-[10px] font-mono text-emerald-400 animate-pulse">● RUNNING</span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-[11px] text-slate-400 leading-relaxed scrollbar-thin">
                    {logs.map((log, lIdx) => (
                      <div key={lIdx} className={log.includes('[ERROR]') ? 'text-rose-400' : ''}>
                        {log}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="text-emerald-400/80 animate-pulse">Loading contents...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Chat panel */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col bg-[#faf9ff]">
              {/* Prompt Pills suggestions */}
              {messages.length === 0 && (
                <div className="px-6 pt-6 flex flex-wrap gap-2 items-center justify-center">
                  {promptPills.map((pill, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(pill)}
                      className="px-3.5 py-2 bg-white hover:bg-[#f0edff] hover:text-[#5b4fcf] border border-[#5b4fcf]/10 hover:border-[#5b4fcf]/30 rounded-full text-xs font-medium text-[#7e7a9a] shadow-sm transition-all active:scale-95"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}

              {/* Message scroll list */}
              <MessageList 
                messages={messages} 
                onSourceClick={handleSourceClick}
              />

              {/* Message Input panel */}
              <InputBox 
                onSendMessage={handleSendMessage} 
                isLoading={isChatLoading}
              />
            </div>
          )}

          {/* TAB 3: File Explorer panel */}
          {activeTab === 'explorer' && (
            <div className="h-full flex overflow-hidden">
              {/* Tree view */}
              <div className="w-64 border-r border-[#5b4fcf]/10 bg-white overflow-y-auto p-4 select-none flex-shrink-0">
                <h3 className="text-xs font-bold text-[#7e7a9a] uppercase tracking-wider mb-4 px-2 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-[#7e7a9a]" />
                  Code Directory
                </h3>
                {files.length > 0 ? (
                  renderTree(buildFileTree())
                ) : (
                  <div className="text-xs italic text-[#7e7a9a] px-2">
                    No files loaded.
                  </div>
                )}
              </div>

              {/* Code Editor Panel */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a] text-slate-100 overflow-hidden">
                {selectedFile ? (
                  <div className="flex flex-col h-full">
                    {/* Editor Header */}
                    <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span className="truncate">{selectedFile.path}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedFile.content);
                          const notifier = document.getElementById('copy-indicator');
                          if (notifier) {
                            notifier.classList.remove('opacity-0');
                            setTimeout(() => notifier.classList.add('opacity-0'), 1500);
                          }
                        }}
                        className="hover:text-white px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                      >
                        Copy Content
                      </button>
                      <span id="copy-indicator" className="absolute right-24 bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] opacity-0 transition-opacity">
                        Copied!
                      </span>
                    </div>

                    {/* Source Code */}
                    <pre className="flex-1 overflow-auto p-5 text-xs font-mono leading-relaxed bg-[#0b0f19] scrollbar-thin">
                      <code className="block text-slate-300">
                        {selectedFile.content.split('\n').map((line, lIdx) => (
                          <div key={lIdx} className="table-row">
                            <span className="table-cell text-slate-600 pr-4 text-right select-none w-8">{lIdx + 1}</span>
                            <span className="table-cell whitespace-pre">{line}</span>
                          </div>
                        ))}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-55">
                    <Code className="w-12 h-12 text-slate-500 mb-3" />
                    <h3 className="font-bold text-base text-slate-300 mb-1">No File Selected</h3>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Select a file from the directory tree to view its contents and code syntax.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Architecture Visualizer panel */}
          {activeTab === 'architecture' && (
            <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-[#1c1a2e] tracking-tight">
                  Architecture Visualization
                </h1>
                <p className="text-sm text-[#7e7a9a]">
                  Explore classified system layers based on imported dependency routes and module weights.
                </p>
              </div>

              {architecture ? (
                <div className="space-y-6">
                  {/* Stats Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                      title="Architectural Layers"
                      value={Object.keys(architecture.layers || {}).length}
                      icon={<Layers className="w-6 h-6 text-[#5b4fcf]" />}
                      description="Classified subsystems"
                    />
                    <StatsCard
                      title="Unknown/Config Files"
                      value={architecture.unknown_files?.length || 0}
                      icon={<HelpCircle className="w-6 h-6 text-amber-500" />}
                      description="Helper, doc, or system files"
                    />
                    <StatsCard
                      title="Total Node Links"
                      value={architecture.edges?.length || 0}
                      icon={<Cpu className="w-6 h-6 text-emerald-500" />}
                      description="Internal import relations"
                    />
                  </div>

                  {/* Layers Grid */}
                  <h3 className="text-lg font-bold text-[#1c1a2e] pt-4">Classified Layers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(architecture.layers || {}).map(([layerName, data]) => {
                      let colorClass = 'text-[#5b4fcf]';
                      let bgHeader = 'bg-[#f0edff]';
                      let dotColor = 'bg-[#5b4fcf]';

                      if (layerName.toLowerCase().includes('backend')) {
                        colorClass = 'text-[#e05c7a]';
                        bgHeader = 'bg-[#ffe8f0]';
                        dotColor = 'bg-[#e05c7a]';
                      } else if (layerName.toLowerCase().includes('ai')) {
                        colorClass = 'text-emerald-600';
                        bgHeader = 'bg-emerald-50';
                        dotColor = 'bg-emerald-500';
                      } else if (layerName.toLowerCase().includes('database')) {
                        colorClass = 'text-amber-600';
                        bgHeader = 'bg-amber-50';
                        dotColor = 'bg-amber-500';
                      }

                      return (
                        <div key={layerName} className="bg-white rounded-3xl border border-[#5b4fcf]/10 overflow-hidden shadow-sm flex flex-col">
                          <div className={`p-4 ${bgHeader} flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 ${dotColor} rounded-full`}></span>
                              <span className={`font-bold text-sm ${colorClass}`}>{layerName}</span>
                            </div>
                            <span className="text-[10px] font-bold bg-white text-[#7e7a9a] px-2 py-0.5 rounded-full">
                              {data.count} Files
                            </span>
                          </div>
                          <div className="p-4 flex-1 overflow-y-auto max-h-48 space-y-1 bg-white">
                            {data.files.map((file, fIdx) => (
                              <div
                                key={fIdx}
                                onClick={() => handleSourceClick(file.path)}
                                className="flex justify-between items-center text-xs p-1.5 hover:bg-[#faf9ff] rounded-lg cursor-pointer transition-colors"
                              >
                                <span className="text-[#1c1a2e] truncate font-mono font-medium max-w-[70%]" title={file.path}>
                                  {file.path.split('/').pop()}
                                </span>
                                <span className="text-[10px] text-[#7e7a9a] font-mono shrink-0">
                                  {file.path}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
                  <Sparkles className="w-10 h-10 text-[#5b4fcf]/45 mx-auto mb-3" />
                  <p className="text-sm text-[#7e7a9a]">No architecture data has been parsed.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Learning Roadmap panel */}
          {activeTab === 'roadmap' && (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-[#1c1a2e] tracking-tight">
                  Learning Roadmap
                </h1>
                <p className="text-sm text-[#7e7a9a]">
                  Follow the step-by-step onboarding plan generated for this project by Nvidia's Llama model.
                </p>
              </div>

              {roadmap ? (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="bg-[#f0edff] rounded-3xl p-6 border border-[#5b4fcf]/10 flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-base text-[#1c1a2e] mb-1">Onboarding Checklist</h3>
                      <p className="text-xs text-[#7e7a9a]">Mark steps as read to track your codebase onboarding completion.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100 text-center">
                        <div className="text-sm font-bold text-[#5b4fcf]">
                          {Object.keys(completedRoadmapSteps).filter(k => completedRoadmapSteps[k]).length}
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-[#7e7a9a] font-bold">Steps Done</div>
                      </div>
                    </div>
                  </div>

                  {/* Checklist steps */}
                  {renderRoadmap()}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-[#5b4fcf]/10 rounded-3xl">
                  <Cpu className="w-10 h-10 text-[#5b4fcf] animate-pulse mx-auto mb-3" />
                  <p className="text-sm text-[#7e7a9a] font-medium">Generating roadmap from code structure...</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Dependencies panel */}
          {activeTab === 'dependencies' && (
            <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-[#1c1a2e] tracking-tight">
                  Dependency Explorer
                </h1>
                <p className="text-sm text-[#7e7a9a]">
                  Scan absolute paths and identify imports or module dependencies in the code files.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={depSearch}
                    onChange={(e) => setDepSearch(e.target.value)}
                    placeholder="Search by file name or imported module name..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#5b4fcf]/10 focus:border-[#5b4fcf]/40 rounded-2xl text-sm focus:outline-none transition-all shadow-sm"
                  />
                  <Search className="w-4 h-4 text-[#7e7a9a] absolute left-3.5 top-3.5" />
                </div>
              </div>

              {dependencies.length > 0 ? (
                <div className="bg-white rounded-3xl border border-[#5b4fcf]/10 overflow-hidden shadow-sm">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full border-collapse text-left text-xs font-mono">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[#7e7a9a] uppercase text-[10px] font-bold tracking-wider">
                          <th className="p-4 w-[35%]">File</th>
                          <th className="p-4 w-[65%]">Dependencies / Imports</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDeps.map((dep, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 align-top">
                              <span 
                                onClick={() => handleSourceClick(dep.path)}
                                className="font-bold text-[#5b4fcf] cursor-pointer hover:underline block"
                              >
                                {dep.file}
                              </span>
                              <span className="text-[10px] text-[#7e7a9a] block mt-0.5">{dep.path}</span>
                            </td>
                            <td className="p-4">
                              {dep.dependencies && dep.dependencies.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {dep.dependencies.map((d, dIdx) => (
                                    <span 
                                      key={dIdx} 
                                      className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600 font-mono"
                                    >
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px] font-sans">None</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white border border-[#5b4fcf]/10 rounded-3xl">
                  <Link className="w-10 h-10 text-[#5b4fcf]/45 mx-auto mb-3" />
                  <p className="text-sm text-[#7e7a9a]">No dependencies extracted yet.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
