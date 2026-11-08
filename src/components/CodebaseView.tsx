import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, FileCode2, Folder, Terminal } from 'lucide-react';
import JSZip from 'jszip';

export const CodebaseView: React.FC = () => {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/python-codebase')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.files) {
          setFiles(data.files);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load codebase:', err);
        setIsLoading(false);
      });
  }, []);

  const handleCopy = () => {
    if (files[selectedFile]) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPythonZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      Object.entries(files).forEach(([relPath, content]) => {
        zip.file(relPath, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai_trading_firm_python.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadFullZip = async () => {
    try {
      setIsZipping(true);
      const res = await fetch('/api/full-codebase');
      const data = await res.json();
      if (!data.success || !data.files) {
        throw new Error('Failed to fetch full codebase');
      }

      const zip = new JSZip();
      Object.entries(data.files as Record<string, string>).forEach(([relPath, content]) => {
        zip.file(relPath, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trading_firm_full_project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download full project ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const fileList = Object.keys(files);

  // Group files by directory
  const rootFiles = fileList.filter((f) => !f.includes('/'));
  const agentFiles = fileList.filter((f) => f.startsWith('trading_firm/agents/'));
  const llmFiles = fileList.filter((f) => f.startsWith('trading_firm/llm/'));
  const dataFiles = fileList.filter((f) => f.startsWith('trading_firm/data/'));
  const coreFiles = fileList.filter((f) => f.startsWith('trading_firm/') && !f.includes('/agents/') && !f.includes('/llm/') && !f.includes('/data/'));

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/70 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Python Multi-Agent Trading Framework</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              NSE / BSE Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Full standalone repository with Python CLI, automated laptop installer scripts (<code className="text-cyan-300">setup_laptop.sh</code> &amp; <code className="text-cyan-300">setup_laptop.bat</code>), Dockerfile, and multi-provider LLMs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadPythonZip}
            disabled={isZipping || isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold transition-all whitespace-nowrap disabled:opacity-50"
            title="Download standalone Python CLI framework"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Python CLI (.zip)</span>
          </button>
          <button
            onClick={handleDownloadFullZip}
            disabled={isZipping || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-lg text-xs transition-all whitespace-nowrap shadow-sm disabled:opacity-50"
            title="Download full project including React Web UI, Server, and Python framework"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Packaging ZIP...' : 'Download Full Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Laptop Installation Guide Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 font-sans">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-white">How to Install in Your Laptop Folder (e.g. &quot;project&quot;)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Windows Guide */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
            <span className="text-cyan-400 font-bold block text-[11px]">Option A: Windows Laptop</span>
            <div className="text-slate-400 text-[11px] leading-relaxed">
              1. Click <strong className="text-white">&quot;Download Full Project (.zip)&quot;</strong> above.
            </div>
            <div className="text-slate-400 text-[11px]">
              2. Extract the ZIP into your laptop folder (e.g. <code className="text-slate-200">C:\projects\trading-firm</code>).
            </div>
            <div className="text-slate-400 text-[11px]">
              3. Open Command Prompt in that folder and run:
            </div>
            <div className="bg-slate-900 p-2 rounded text-slate-200 border border-slate-800 text-[11px]">
              setup_laptop.bat
            </div>
            <div className="text-slate-400 text-[11px]">
              4. Run trading committee:
            </div>
            <div className="bg-slate-900 p-2 rounded text-emerald-400 border border-slate-800 text-[11px]">
              python main.py --ticker RELIANCE --exchange NSE --currency INR
            </div>
          </div>

          {/* Mac / Linux Guide */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
            <span className="text-cyan-400 font-bold block text-[11px]">Option B: Mac / Linux Laptop</span>
            <div className="text-slate-400 text-[11px] leading-relaxed">
              1. Click <strong className="text-white">&quot;Download Full Project (.zip)&quot;</strong> above.
            </div>
            <div className="text-slate-400 text-[11px]">
              2. Extract into your laptop folder (e.g. <code className="text-slate-200">~/projects/trading-firm</code>).
            </div>
            <div className="text-slate-400 text-[11px]">
              3. Open Terminal in that folder and run:
            </div>
            <div className="bg-slate-900 p-2 rounded text-slate-200 border border-slate-800 text-[11px]">
              chmod +x setup_laptop.sh &amp;&amp; ./setup_laptop.sh
            </div>
            <div className="text-slate-400 text-[11px]">
              4. Run trading committee:
            </div>
            <div className="bg-slate-900 p-2 rounded text-emerald-400 border border-slate-800 text-[11px]">
              python main.py --ticker SENSEX --exchange BSE --currency INR
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <div>
            <span>Or run with Docker: </span>
            <code className="text-cyan-300">docker compose up --build</code>
          </div>
          <div>
            <span>Run local web app: </span>
            <code className="text-cyan-300">npm install &amp;&amp; npm run dev</code>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left File Tree */}
        <div className="md:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-3 h-[600px] overflow-y-auto space-y-4 font-mono text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider mb-2">
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              <span>Project Root</span>
            </div>
            <div className="space-y-1 pl-2">
              {rootFiles.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                    selectedFile === f ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider mb-2">
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span>trading_firm / Core</span>
            </div>
            <div className="space-y-1 pl-2">
              {coreFiles.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                    selectedFile === f ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.replace('trading_firm/', '')}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider mb-2">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span>trading_firm / agents</span>
            </div>
            <div className="space-y-1 pl-2">
              {agentFiles.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                    selectedFile === f ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.replace('trading_firm/agents/', '')}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider mb-2">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>trading_firm / llm</span>
            </div>
            <div className="space-y-1 pl-2">
              {llmFiles.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                    selectedFile === f ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.replace('trading_firm/llm/', '')}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider mb-2">
              <Folder className="w-3.5 h-3.5 text-emerald-400" />
              <span>trading_firm / data</span>
            </div>
            <div className="space-y-1 pl-2">
              {dataFiles.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                    selectedFile === f ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.replace('trading_firm/data/', '')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Code View */}
        <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
          <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200">{selectedFile}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="p-4 flex-1 overflow-auto font-mono text-xs text-slate-300 leading-relaxed select-text">
            {isLoading ? (
              <div className="text-slate-500 italic">Loading file contents...</div>
            ) : files[selectedFile] ? (
              <pre className="whitespace-pre">{files[selectedFile]}</pre>
            ) : (
              <div className="text-slate-500 italic">Select a file from the explorer on the left.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
