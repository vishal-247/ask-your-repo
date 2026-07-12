import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ZoomIn, ZoomOut, Search, Info,
  FileCode, Layers, GitBranch, ShieldAlert, Cpu, Database as DbIcon,
  Globe, Server, Play, Pause, RefreshCw
} from "lucide-react";
import { backendApi, ArchitectureResponse, ArchitectureFile, FileDependency } from "../lib/api";

interface ArchitectureModalProps {
  repoName: string;
  onClose: () => void;
}

interface PositionedFile {
  path: string;
  name: string;
  x: number;
  y: number;
  layer: string;
  confidence: number;
  reasons: string[];
  scores: Record<string, number>;
  secondaryLayers: string[];
}

interface PositionedHub {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  icon: React.ReactNode;
}

interface FileLink {
  sourcePath: string;
  targetPath: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  id: string;
}

export function ArchitectureModal({ repoName, onClose }: ArchitectureModalProps) {
  const [data, setData] = useState<ArchitectureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive States
  const [selectedFile, setSelectedFile] = useState<PositionedFile | null>(null);
  const [hoveredFile, setHoveredFile] = useState<PositionedFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Physics & Animation States
  const [animateParticles, setAnimateParticles] = useState(true);
  const [growthProgress, setGrowthProgress] = useState(0); // 0 to 1

  // Zoom & Pan States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const isMouseDown = useRef(false);
  const mouseDownCoords = useRef({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  // Fetch Architecture Data
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await backendApi.visualizeArchitecture();
        setData(res);
        
        // Trigger root growth animation sequence
        setTimeout(() => {
          let start = 0;
          const duration = 1200; // 1.2s
          const startTime = performance.now();
          
          function animate(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setGrowthProgress(eased);
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }
          requestAnimationFrame(animate);
        }, 150);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load architecture visualization.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Hub Definitions (Layer Coordinates)
  const hubs: PositionedHub[] = useMemo(() => [
    { id: "frontend", label: "Frontend", x: 260, y: 240, color: "#22d3ee", icon: <Globe size={18} /> },
    { id: "backend", label: "Backend", x: 740, y: 240, color: "#818cf8", icon: <Server size={18} /> },
    { id: "ai", label: "AI", x: 260, y: 560, color: "#10b981", icon: <Cpu size={18} /> },
    { id: "database", label: "Database", x: 740, y: 560, color: "#f59e0b", icon: <DbIcon size={18} /> },
  ], []);

  // Position Files Radially Around Hubs
  const positionedFiles = useMemo<PositionedFile[]>(() => {
    if (!data) return [];
    
    const result: PositionedFile[] = [];
    const layers = ["Frontend", "Backend", "AI", "Database"];
    
    layers.forEach(layerName => {
      const hub = hubs.find(h => h.label.toLowerCase() === layerName.toLowerCase());
      if (!hub) return;
      
      const layerData = (data.layers || {})[layerName];
      if (!layerData || !layerData.files) return;
      
      const files = layerData.files;
      const count = files.length;
      if (count === 0) return;
      
      // Determine angular arc for root expansion
      let startAngle = 0;
      let angleSpan = 360;
      
      if (hub.id === "frontend") {
        startAngle = 110;
        angleSpan = 140; // pointing left/up
      } else if (hub.id === "backend") {
        startAngle = -70;
        angleSpan = 140; // pointing right/up
      } else if (hub.id === "ai") {
        startAngle = 110;
        angleSpan = -140; // pointing left/down
      } else if (hub.id === "database") {
        startAngle = 70;
        angleSpan = -140; // pointing right/down
      }

      const radius = 130 + Math.min(count * 6, 80); // dynamically expand radius for more files

      files.forEach((file, index) => {
        // Distribute files evenly along the arc
        const angleDeg = count === 1 
          ? startAngle + angleSpan / 2
          : startAngle + (index / (count - 1)) * angleSpan;
        const angleRad = (angleDeg * Math.PI) / 180;
        
        const x = hub.x + radius * Math.cos(angleRad);
        const y = hub.y + radius * Math.sin(angleRad);
        
        result.push({
          path: file.path,
          name: file.path.split("/").pop() || file.path,
          x,
          y,
          layer: layerName,
          confidence: file.confidence,
          reasons: file.reasons,
          scores: file.scores,
          secondaryLayers: file.secondary_layers || []
        });
      });
    });

    return result;
  }, [data, hubs]);

  // Create a map of file path -> positioned file for quick lookup
  const fileMap = useMemo(() => {
    const map = new Map<string, PositionedFile>();
    positionedFiles.forEach(f => map.set(f.path, f));
    return map;
  }, [positionedFiles]);

  // Resolve dependencies into node-to-node links
  const fileLinks = useMemo<FileLink[]>(() => {
    if (!data || positionedFiles.length === 0) return [];
    
    const links: FileLink[] = [];
    const allPaths = positionedFiles.map(f => f.path);
    
    (data.file_dependencies || []).forEach(fd => {
      const sourceNode = fileMap.get(fd.path);
      if (!sourceNode) return;
      
      fd.dependencies.forEach(dep => {
        // Resolve import to actual path in repository
        let targetPath: string | undefined;
        
        if (dep.startsWith(".")) {
          // Relative JS/TS import
          const sourceDir = fd.path.split("/").slice(0, -1);
          const parts = dep.split("/");
          const resolvedParts = [...sourceDir];
          for (const part of parts) {
            if (part === "..") {
              resolvedParts.pop();
            } else if (part !== ".") {
              resolvedParts.push(part);
            }
          }
          const relPath = resolvedParts.join("/");
          targetPath = allPaths.find(p => {
            const clean = p.replace(/\.[^/.]+$/, ""); // strip extension
            return clean.toLowerCase() === relPath.toLowerCase() || clean.toLowerCase().endsWith(relPath.toLowerCase());
          });
        } else {
          // Absolute / python package import (e.g. backend.data.store)
          const cleanDep = dep.replace(/\./g, "/").toLowerCase();
          targetPath = allPaths.find(p => {
            const clean = p.replace(/\.[^/.]+$/, "").toLowerCase();
            return clean === cleanDep || clean.endsWith("/" + cleanDep);
          });
        }
        
        if (targetPath) {
          const targetNode = fileMap.get(targetPath);
          if (targetNode && sourceNode.path !== targetNode.path) {
            links.push({
              sourcePath: sourceNode.path,
              targetPath: targetNode.path,
              sourceX: sourceNode.x,
              sourceY: sourceNode.y,
              targetX: targetNode.x,
              targetY: targetNode.y,
              id: `${sourceNode.path}->${targetNode.path}`
            });
          }
        }
      });
    });
    
    return links;
  }, [data, positionedFiles, fileMap]);

  // Filtered files for search
  const searchedFiles = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const query = searchQuery.toLowerCase();
    return new Set(
      positionedFiles
        .filter(f => f.path.toLowerCase().includes(query) || f.layer.toLowerCase().includes(query))
        .map(f => f.path)
    );
  }, [searchQuery, positionedFiles]);

  // Winding root paths builder helper
  const drawRootCurve = (x0: number, y0: number, x1: number, y1: number) => {
    // Generate organic S-curves/winding curves
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    
    // Add offset for winding effect
    const offsetX = (y1 - y0) * 0.15;
    const offsetY = (x0 - x1) * 0.15;
    
    return `M ${x0} ${y0} C ${midX + offsetX} ${y0 + offsetY}, ${midX - offsetX} ${y1 - offsetY}, ${x1} ${y1}`;
  };

  // Zoom/Pan Helpers
  const handleZoom = (factor: number) => {
    setZoom(prev => Math.min(Math.max(prev * factor, 0.4), 4));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    isMouseDown.current = true;
    mouseDownCoords.current = { x: e.clientX, y: e.clientY };
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    const dx = e.clientX - mouseDownCoords.current.x;
    const dy = e.clientY - mouseDownCoords.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 3) {
      if (!isDragging) setIsDragging(true);
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 4));
  };

  // Colors mapping helper
  const getLayerColor = (layerName: string) => {
    switch (layerName.toLowerCase()) {
      case "frontend": return "#22d3ee";
      case "backend": return "#818cf8";
      case "ai": return "#10b981";
      case "database": return "#f59e0b";
      default: return "#a09dc0";
    }
  };

  // Connected files mapping for hovered/selected files
  const activeConnections = useMemo(() => {
    const active = hoveredFile || selectedFile;
    if (!active) return null;
    
    const incoming = new Set<string>();
    const outgoing = new Set<string>();
    
    fileLinks.forEach(link => {
      if (link.sourcePath === active.path) {
        outgoing.add(link.targetPath);
      }
      if (link.targetPath === active.path) {
        incoming.add(link.sourcePath);
      }
    });

    return { incoming, outgoing };
  }, [hoveredFile, selectedFile, fileLinks]);

  const activeFile = selectedFile || hoveredFile;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 w-full h-full flex flex-col z-[100]"
      style={{
        background: "rgba(10, 8, 22, 0.92)",
        backdropFilter: "blur(20px)",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(15, 12, 33, 0.5)" }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center" 
            style={{ background: "linear-gradient(135deg, #7c6ef5, #5b4fcf)", boxShadow: "0 2px 12px rgba(91,79,207,0.4)" }}
          >
            <GitBranch size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-[15px] tracking-tight leading-none" style={{ fontFamily: "'Geist', sans-serif" }}>
              {repoName}
            </h2>
            <span className="text-[11.5px] text-indigo-200/50 font-medium mt-1 inline-block">Repository Visual Architecture Map</span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 max-w-sm w-full mx-8">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5 w-full">
            <Search size={14} className="text-indigo-200/40" />
            <input
              type="text"
              placeholder="Search file in tree (e.g. main, api)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-[13px] w-full placeholder:text-indigo-200/20"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-indigo-200/40 hover:text-white transition-colors">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar & Close */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button 
              onClick={() => handleZoom(1.2)} 
              title="Zoom In"
              className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-200/60 hover:text-white transition-colors"
            >
              <ZoomIn size={14} />
            </button>
            <button 
              onClick={() => handleZoom(0.8)} 
              title="Zoom Out"
              className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-200/60 hover:text-white transition-colors"
            >
              <ZoomOut size={14} />
            </button>
            <button 
              onClick={handleReset} 
              title="Reset Zoom & Pan"
              className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-200/60 hover:text-white transition-colors text-[11.5px] font-mono px-2"
            >
              Reset
            </button>
          </div>

          <div style={{ width: 1, height: 20, background: "rgba(255, 255, 255, 0.12)", margin: "0 8px" }} />

          {/* Particle animation control */}
          <button 
            onClick={() => setAnimateParticles(!animateParticles)} 
            title={animateParticles ? "Pause Connection Pulses" : "Play Connection Pulses"}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-indigo-200/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {animateParticles ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button 
            onClick={onClose} 
            className="p-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-xl text-indigo-200/60 hover:text-red-400 transition-all"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <RefreshCw size={28} className="text-indigo-400 animate-spin" />
            <span className="text-[14px] text-indigo-200/60 font-medium">Extracting repository connections & structure...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 max-w-md mx-auto text-center px-6">
            <ShieldAlert size={36} className="text-red-400" />
            <h4 className="text-white font-semibold text-[16px]">Architecture Visualization Failed</h4>
            <p className="text-indigo-200/50 text-[13px] leading-relaxed">{error}</p>
            <button 
              onClick={onClose}
              className="mt-2 px-4 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-lg text-[13px] transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            {/* Visual Canvas */}
            <div 
              className={`flex-1 h-full select-none overflow-hidden relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {/* Legend & Instructions */}
              <div className="absolute top-4 left-6 z-10 flex flex-col gap-2 pointer-events-none">
                <div className="flex items-center gap-2 bg-slate-950/70 border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-md">
                  <Info size={13} className="text-indigo-300" />
                  <span className="text-[11.5px] text-indigo-200/60">Drag to Pan · Wheel to Zoom · Click nodes to select</span>
                </div>
                <div className="flex flex-col gap-1 bg-slate-950/60 border border-white/5 rounded-lg p-2.5 backdrop-blur-md">
                  <span className="text-[10px] text-indigo-300/40 font-semibold tracking-wider uppercase mb-1">Architecture Layers</span>
                  {hubs.map(h => (
                    <div key={h.id} className="flex items-center gap-2 text-[11px] text-indigo-200/75">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: h.color, boxShadow: `0 0 8px ${h.color}80` }} />
                      {h.label}
                    </div>
                  ))}
                  {data && (data.unknown_files || []).length > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-indigo-200/40">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                      Unclassified ({(data.unknown_files || []).length} files)
                    </div>
                  )}
                </div>
              </div>

              {/* Canvas SVG */}
              <svg
                ref={svgRef}
                className="w-full h-full"
                viewBox="0 0 1000 800"
              >
                {/* SVG Filters for Neon Glows */}
                <defs>
                  <filter id="glow-frontend" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-backend" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-ai" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-database" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-core" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} transform-origin="center">
                  
                  {/* LAYER 1: Core Tree Roots (Grow outwards from Core to Hubs) */}
                  {hubs.map((hub) => {
                    const windingPath = drawRootCurve(500, 400, hub.x, hub.y);
                    
                    return (
                      <g key={`main-root-${hub.id}`}>
                        {/* Winding base thick root (shadow/glow) */}
                        <path
                          d={windingPath}
                          fill="none"
                          stroke={`${hub.color}15`}
                          strokeWidth={14}
                          strokeLinecap="round"
                        />
                        {/* Winding active root core */}
                        <motion.path
                          d={windingPath}
                          fill="none"
                          stroke={hub.color}
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          initial={{ strokeDasharray: "1000", strokeDashoffset: "1000" }}
                          animate={{ strokeDashoffset: (1 - Math.min(growthProgress * 1.5, 1)) * 1000 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          opacity={0.7}
                        />
                      </g>
                    );
                  })}

                  {/* LAYER 2: File Root Branches (Grow outwards from Hubs to Files) */}
                  {growthProgress > 0.4 && positionedFiles.map((file) => {
                    const hub = hubs.find(h => h.label.toLowerCase() === file.layer.toLowerCase());
                    if (!hub) return null;
                    
                    const hubColor = hub.color;
                    const pathD = drawRootCurve(hub.x, hub.y, file.x, file.y);
                    const isSearched = searchedFiles.size > 0 && searchedFiles.has(file.path);
                    const isHighlighted = activeConnections 
                      ? activeConnections.incoming.has(file.path) || activeConnections.outgoing.has(file.path) || activeFile?.path === file.path
                      : true;

                    return (
                      <g key={`branch-${file.path}`}>
                        <motion.path
                          d={pathD}
                          fill="none"
                          stroke={hubColor}
                          strokeWidth={selectedFile?.path === file.path || hoveredFile?.path === file.path ? 1.8 : 0.8}
                          opacity={isSearched ? 0.95 : isHighlighted ? 0.28 : 0.05}
                          strokeDasharray="6,4"
                          initial={{ strokeDasharray: "300", strokeDashoffset: "300" }}
                          animate={{ strokeDashoffset: (1 - Math.min((growthProgress - 0.4) * 1.6, 1)) * 300 }}
                          transition={{ duration: 0.7 }}
                        />
                      </g>
                    );
                  })}

                  {/* LAYER 3: File-to-File Connections (Dependencies) */}
                  {growthProgress > 0.7 && fileLinks.map((link) => {
                    const isSourceHovered = activeFile?.path === link.sourcePath;
                    const isTargetHovered = activeFile?.path === link.targetPath;
                    const isActive = isSourceHovered || isTargetHovered;
                    
                    // Dim non-active connections if we have a selection/hover
                    if (activeFile && !isActive) return null;

                    const strokeColor = isSourceHovered ? "#38bdf8" : isTargetHovered ? "#34d399" : "rgba(165, 180, 252, 0.15)";
                    const strokeWidth = isActive ? 1.8 : 0.9;
                    const pathD = drawRootCurve(link.sourceX, link.sourceY, link.targetX, link.targetY);

                    return (
                      <g key={`dependency-${link.id}`}>
                        {/* Connection line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          opacity={isActive ? 0.85 : 0.3}
                          strokeDasharray={isActive ? "none" : "4,4"}
                        />

                        {/* Animated moving pulse dots along connection paths */}
                        {animateParticles && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            opacity={isActive ? 0.9 : 0.4}
                            strokeDasharray="1, 80"
                            className="pulse-dot"
                            style={{
                              animation: `pulse-move ${isActive ? '2.5s' : '4.5s'} linear infinite`,
                              animationDelay: `${Math.random() * 2}s`
                            }}
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* LAYER 4: Hub Nodes (Layers) */}
                  {hubs.map((hub) => {
                    const layerData = (data?.layers || {})[hub.label];
                    const fileCount = layerData?.count || 0;
                    
                    return (
                      <g key={`hub-${hub.id}`} transform={`translate(${hub.x}, ${hub.y})`}>
                        {/* Glow filter aura */}
                        <circle
                          r={26}
                          fill={`${hub.color}08`}
                          stroke={`${hub.color}15`}
                          strokeWidth={1}
                          filter={`url(#glow-${hub.id})`}
                        />
                        {/* Outer rotating/pulsating dash circle */}
                        <motion.circle
                          r={20}
                          fill="none"
                          stroke={`${hub.color}50`}
                          strokeWidth={1}
                          strokeDasharray="4, 4"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Node core */}
                        <circle
                          r={16}
                          fill="#0f0c21"
                          stroke={hub.color}
                          strokeWidth={2}
                          className="cursor-pointer"
                        />
                        {/* Icon */}
                        <g transform="translate(-9, -9)" className="pointer-events-none text-white opacity-80" style={{ color: hub.color }}>
                          {hub.icon}
                        </g>
                        {/* Label & file count indicator */}
                        <g transform="translate(0, 32)">
                          <text
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="11.5px"
                            fontWeight="600"
                            style={{ letterSpacing: "-0.01em" }}
                          >
                            {hub.label}
                          </text>
                          <text
                            textAnchor="middle"
                            y="14"
                            fill="#818cf8"
                            fontSize="9px"
                            fontWeight="500"
                            opacity={0.6}
                          >
                            {fileCount} files
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* LAYER 5: Repository Central Node */}
                  <g transform="translate(500, 400)">
                    <circle
                      r={36}
                      fill="rgba(10, 8, 22, 0.95)"
                      stroke="#818cf8"
                      strokeWidth={2.5}
                      filter="url(#glow-core)"
                    />
                    <motion.circle
                      r={42}
                      fill="none"
                      stroke="rgba(129, 140, 248, 0.25)"
                      strokeWidth={1.5}
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <text
                      textAnchor="middle"
                      y="4"
                      fill="#ffffff"
                      fontSize="10px"
                      fontWeight="bold"
                      fontFamily="'Geist Mono', monospace"
                      style={{ letterSpacing: "0.06em" }}
                    >
                      CORE
                    </text>
                  </g>

                  {/* LAYER 6: File Nodes (Outer level) */}
                  {growthProgress > 0.6 && positionedFiles.map((file) => {
                    const hub = hubs.find(h => h.label.toLowerCase() === file.layer.toLowerCase());
                    const isSelected = selectedFile?.path === file.path;
                    const isHovered = hoveredFile?.path === file.path;
                    const isSearched = searchedFiles.size > 0 && searchedFiles.has(file.path);
                    
                    const isHighlighted = activeConnections 
                      ? activeConnections.incoming.has(file.path) || activeConnections.outgoing.has(file.path) || isSelected || isHovered
                      : true;

                    const color = hub?.color || "#a09dc0";

                    return (
                      <g 
                        key={`node-${file.path}`} 
                        transform={`translate(${file.x}, ${file.y})`}
                        onMouseEnter={() => setHoveredFile(file)}
                        onMouseLeave={() => setHoveredFile(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                        }}
                        className="cursor-pointer"
                        opacity={isSearched ? 1 : isHighlighted ? 1 : 0.12}
                        style={{ transition: "opacity 0.25s" }}
                      >
                        {/* Interactive hit area */}
                        <circle
                          r={18}
                          fill="transparent"
                          pointerEvents="all"
                        />

                        {/* Hover/Selection glow backing ring */}
                        {(isSelected || isHovered || isSearched) && (
                          <motion.circle
                            r={12}
                            fill="none"
                            stroke={color}
                            strokeWidth={1.5}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.4, opacity: [0, 0.4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                          />
                        )}
                        
                        {/* File node circle */}
                        <circle
                          r={6}
                          fill={isSelected ? color : "#0f0c21"}
                          stroke={color}
                          strokeWidth={isHovered || isSelected ? 2.2 : 1.2}
                          style={{ transition: "stroke-width 0.2s, fill 0.2s" }}
                        />

                        {/* File Text Label */}
                        <text
                          textAnchor={file.x > 500 ? "start" : "end"}
                          x={file.x > 500 ? 11 : -11}
                          y="3.5"
                          fill={isSelected || isHovered ? "#ffffff" : isSearched ? color : "rgba(255, 255, 255, 0.65)"}
                          fontSize="9.5px"
                          fontWeight={isSelected || isHovered || isSearched ? "600" : "400"}
                          style={{
                            transition: "fill 0.2s, font-weight 0.2s",
                            textShadow: isHovered || isSelected ? `0 0 6px ${color}80` : "none"
                          }}
                        >
                          {file.name}
                        </text>
                      </g>
                    );
                  })}

                </g>
              </svg>
            </div>

            {/* Side Info Panel (Selected File Info) */}
            <AnimatePresence>
              {activeFile && (
                <motion.div
                  initial={{ x: 340, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 340, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute right-0 top-0 bottom-0 w-80 bg-slate-950/85 backdrop-blur-xl border-l border-white/5 flex flex-col z-20"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <FileCode size={16} style={{ color: getLayerColor(activeFile.layer) }} />
                      <span className="text-[13px] text-white font-semibold">File Inspector</span>
                    </div>
                    <button 
                      onClick={() => { setSelectedFile(null); setHoveredFile(null); }}
                      className="p-1 hover:bg-white/10 rounded text-indigo-200/40 hover:text-white transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
                    {/* File Path & Layer */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            background: `${getLayerColor(activeFile.layer)}15`,
                            color: getLayerColor(activeFile.layer),
                            border: `1px solid ${getLayerColor(activeFile.layer)}30`
                          }}
                        >
                          {activeFile.layer} Layer
                        </span>
                        <div className="flex items-center gap-1.5 text-indigo-300/40 text-[10.5px]">
                          <Layers size={11} />
                          <span>Confidence: <b>{Math.round(activeFile.confidence * 100)}%</b></span>
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-[14.5px] mt-2.5 break-all leading-snug">
                        {activeFile.name}
                      </h3>
                      <p className="text-indigo-200/40 text-[11px] font-mono mt-1 break-all bg-white/5 rounded-lg p-2 border border-white/5">
                        {activeFile.path}
                      </p>
                    </div>

                    {/* Classifier Scores breakdown */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2.5">
                      <h4 className="text-[11px] text-white font-medium flex items-center gap-1.5">
                        <Info size={11} className="text-indigo-400" />
                        <span>Classifier Score Breakdown</span>
                      </h4>
                      <div className="flex flex-col gap-2">
                        {Object.entries(activeFile.scores).map(([layerName, score]) => {
                          const isPrimary = activeFile.layer.toLowerCase() === layerName.toLowerCase();
                          const percent = Math.min((score / 20) * 100, 100);
                          return (
                            <div key={layerName} className="flex flex-col gap-1 text-[11px]">
                              <div className="flex justify-between items-center">
                                <span className={isPrimary ? "text-white font-semibold" : "text-indigo-200/40"}>
                                  {layerName} {isPrimary && "•"}
                                </span>
                                <span className="font-mono text-indigo-300">{score}</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${percent}%`, 
                                    background: getLayerColor(layerName),
                                    opacity: isPrimary ? 1 : 0.4
                                  }} 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Classification Reasons */}
                    {activeFile.reasons.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-indigo-300/40 font-bold uppercase tracking-wider">Classification Triggers</span>
                        <div className="flex flex-col gap-1.5">
                          {activeFile.reasons.map((reason, idx) => (
                            <div key={idx} className="flex gap-2 text-[11px] text-indigo-200/60 leading-relaxed">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Connection lists */}
                    <div className="flex flex-col gap-4">
                      {/* Incoming connections */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-indigo-300/40 font-bold uppercase tracking-wider">Depended on by (Incoming)</span>
                        {activeConnections && activeConnections.incoming.size > 0 ? (
                          <div className="flex flex-col gap-1">
                            {[...activeConnections.incoming].map(path => (
                              <div 
                                key={path} 
                                onClick={() => setSelectedFile(fileMap.get(path) || null)}
                                className="text-[11px] text-indigo-200/60 hover:text-white cursor-pointer truncate hover:underline"
                              >
                                ← {path.split("/").pop()}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-indigo-200/20 italic">No incoming file imports</span>
                        )}
                      </div>

                      {/* Outgoing connections */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-indigo-300/40 font-bold uppercase tracking-wider">Imports / Depends on (Outgoing)</span>
                        {activeConnections && activeConnections.outgoing.size > 0 ? (
                          <div className="flex flex-col gap-1">
                            {[...activeConnections.outgoing].map(path => (
                              <div 
                                key={path} 
                                onClick={() => setSelectedFile(fileMap.get(path) || null)}
                                className="text-[11px] text-indigo-200/60 hover:text-white cursor-pointer truncate hover:underline"
                              >
                                → {path.split("/").pop()}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-indigo-200/20 italic">No outgoing file imports</span>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Global CSS for particle motion animation */}
      <style>{`
        @keyframes pulse-move {
          0% {
            stroke-dashoffset: 80;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .pulse-dot {
          animation-fill-mode: forwards;
        }
      `}</style>
    </motion.div>
  );
}
