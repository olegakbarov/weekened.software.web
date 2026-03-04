"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Tab = "browser" | "agent" | "editor";
type View = "project" | "newProject";

type Project = {
  name: string;
  status: "running" | "idle";
  terminals: { label: string; active?: boolean }[];
};

const INITIAL_PROJECTS: Project[] = [
  {
    name: "landing-page",
    status: "idle",
    terminals: [],
  },
  { name: "api-server", status: "idle", terminals: [] },
];

const FULL_PROJECTS: Project[] = [
  {
    name: "synth",
    status: "running",
    terminals: [{ label: "dev server", active: true }, { label: "claude" }],
  },
  {
    name: "landing-page",
    status: "idle",
    terminals: [],
  },
  { name: "api-server", status: "idle", terminals: [] },
];

const AGENT_LINES = [
  { prefix: "$", text: 'claude "build a web audio synthesizer"', style: "cmd" },
  { prefix: "", text: "", style: "dim" },
  { prefix: "", text: "Reading project structure...", style: "dim" },
  { prefix: "", text: "Found 4 files in src/", style: "dim" },
  { prefix: "", text: "", style: "dim" },
  { prefix: "+", text: "Creating src/synth/oscillator.ts", style: "green" },
  { prefix: "+", text: "Creating src/synth/filter.ts", style: "green" },
  { prefix: "+", text: "Creating src/components/keyboard.tsx", style: "green" },
  { prefix: "~", text: "Updating src/app.tsx", style: "yellow" },
  { prefix: "+", text: "Adding tone.js dependency", style: "green" },
  { prefix: "", text: "", style: "dim" },
  { prefix: "✓", text: "Done. 4 files created, 1 updated.", style: "done" },
];

function BrowserPane() {
  return (
    <div className="m-pane">
      <div className="m-browser-page te-synth">
        {/* OP-1 style screen */}
        <div className="te-screen">
          <svg viewBox="0 0 280 100" className="te-screen-svg">
            {/* Waveform - sawtooth */}
            <g opacity="0.9">
              {Array.from({ length: 14 }).map((_, i) => {
                const x = 20 + i * 18;
                return (
                  <line key={i} x1={x} y1={70} x2={x + 18} y2={26} stroke="currentColor" strokeWidth="1.2" />
                );
              })}
              {Array.from({ length: 13 }).map((_, i) => {
                const x = 38 + i * 18;
                return (
                  <line key={`d${i}`} x1={x} y1={26} x2={x} y2={70} stroke="currentColor" strokeWidth="1.2" />
                );
              })}
            </g>
            {/* Labels */}
            <text x="16" y="16" fontSize="8" fill="currentColor" opacity="0.5" fontFamily="inherit">synth</text>
            <text x="240" y="16" fontSize="8" fill="currentColor" opacity="0.5" fontFamily="inherit" textAnchor="end">A4 440</text>
            <text x="16" y="92" fontSize="7" fill="currentColor" opacity="0.35" fontFamily="inherit">saw</text>
            {/* ADSR mini */}
            <polyline points="100,92 104,80 110,85 128,85 140,92" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
            <text x="240" y="92" fontSize="7" fill="currentColor" opacity="0.35" fontFamily="inherit" textAnchor="end">-3.2db</text>
          </svg>
        </div>

        {/* Four colored encoders */}
        <div className="te-encoders">
          {[
            { color: "#e95420", label: "1", angle: 135 },
            { color: "#47a0e0", label: "2", angle: -45 },
            { color: "#e8e4df", label: "3", angle: 30 },
            { color: "#5eb86c", label: "4", angle: 90 },
          ].map((enc) => (
            <div key={enc.label} className="te-enc">
              <div className="te-enc-ring" style={{ borderColor: enc.color }}>
                <div className="te-enc-dot" style={{ transform: `rotate(${enc.angle}deg)`, background: enc.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section: mode buttons + sequencer pads */}
        <div className="te-bottom">
          <div className="te-modes">
            {["synth", "drum", "tape", "mix"].map((m, i) => (
              <div key={m} className={`te-mode${i === 0 ? " active" : ""}`}>{m}</div>
            ))}
          </div>
          <div className="te-seq">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`te-seq-step${i === 2 || i === 6 || i === 10 || i === 14 ? " on" : ""}${i === 2 ? " now" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentPane({
  typedLines,
  currentLineTyped,
}: {
  typedLines: number;
  currentLineTyped: string;
}) {
  return (
    <div className="m-pane m-terminal-bg">
      {AGENT_LINES.map((line, i) => {
        if (i > typedLines) return null;
        const isCurrentLine = i === typedLines;
        const displayText = isCurrentLine ? currentLineTyped : line.text;

        if (line.style === "dim") {
          return (
            <div key={i} className="m-term-line m-term-dim">
              {displayText || "\u00A0"}
            </div>
          );
        }
        if (line.style === "cmd") {
          return (
            <div key={i} className="m-term-line">
              <span className="m-term-prompt">{line.prefix}</span>
              <span className="m-term-cmd">{displayText}</span>
              {isCurrentLine && <span className="m-cursor">|</span>}
            </div>
          );
        }
        if (line.style === "green") {
          return (
            <div key={i} className="m-term-line">
              <span className="m-term-green">{line.prefix}</span>{" "}
              {displayText}
              {isCurrentLine && <span className="m-cursor">|</span>}
            </div>
          );
        }
        if (line.style === "yellow") {
          return (
            <div key={i} className="m-term-line">
              <span className="m-term-yellow">{line.prefix}</span>{" "}
              {displayText}
              {isCurrentLine && <span className="m-cursor">|</span>}
            </div>
          );
        }
        if (line.style === "done") {
          return (
            <div key={i} className="m-term-line">
              <span className="m-term-green">{line.prefix}</span>{" "}
              <span className="m-term-bold">{displayText}</span>
              {isCurrentLine && <span className="m-cursor">|</span>}
            </div>
          );
        }
        return null;
      })}
      {typedLines >= AGENT_LINES.length && (
        <>
          <div className="m-term-line m-term-dim">&nbsp;</div>
          <div className="m-term-line">
            <span className="m-term-prompt">$</span>
            <span className="m-cursor">|</span>
          </div>
        </>
      )}
    </div>
  );
}

function EditorPane() {
  return (
    <div className="m-pane m-editor-layout">
      <div className="m-editor-main">
        <div className="m-editor-tab-bar">
          <span className="m-editor-file active">oscillator.ts</span>
          <span className="m-editor-file">filter.ts</span>
        </div>
        <div className="m-editor-code">
          <div className="m-code-line">
            <span className="m-ln">1</span>
            <span className="m-kw">import</span>
            {" { ctx } "}
            <span className="m-kw">from</span>
            <span className="m-str"> &quot;./audio&quot;</span>;
          </div>
          <div className="m-code-line">
            <span className="m-ln">2</span>
          </div>
          <div className="m-code-line">
            <span className="m-ln">3</span>
            <span className="m-kw">export function</span>
            {" "}
            <span className="m-fn">createOsc</span>
            {"(type: OscillatorType) {"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">4</span>
            {"  "}
            <span className="m-kw">const</span>
            {" osc = ctx."}
            <span className="m-fn">createOscillator</span>
            {"();"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">5</span>
            {"  osc.type = type;"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">6</span>
          </div>
          <div className="m-code-line">
            <span className="m-ln">7</span>
            {"  "}
            <span className="m-kw">const</span>
            {" gain = ctx."}
            <span className="m-fn">createGain</span>
            {"();"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">8</span>
            {"  gain.gain.value = "}
            <span className="m-num">0</span>
            {";"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">9</span>
            {"  osc."}
            <span className="m-fn">connect</span>
            {"(gain)."}
            <span className="m-fn">connect</span>
            {"(ctx.destination);"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">10</span>
            {"  osc."}
            <span className="m-fn">start</span>
            {"();"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">11</span>
          </div>
          <div className="m-code-line">
            <span className="m-ln">12</span>
            {"  "}
            <span className="m-kw">return</span>
            {" { osc, gain };"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">13</span>
            {"}"}
          </div>
        </div>
      </div>
      <div className="m-file-tree">
        <div className="m-tree-header">files</div>
        <div className="m-tree-item m-tree-dir">&#9660; src/</div>
        <div className="m-tree-item m-tree-file">
          &nbsp; app.tsx
        </div>
        <div className="m-tree-item m-tree-dir">&#9660; synth/</div>
        <div className="m-tree-item m-tree-file m-tree-active m-tree-new">
          &nbsp;&nbsp; oscillator.ts
        </div>
        <div className="m-tree-item m-tree-file m-tree-new">
          &nbsp;&nbsp; filter.ts
        </div>
        <div className="m-tree-item m-tree-file m-tree-new">
          &nbsp;&nbsp; audio.ts
        </div>
        <div className="m-tree-item m-tree-dir">&#9660; components/</div>
        <div className="m-tree-item m-tree-file m-tree-new">
          &nbsp;&nbsp; keyboard.tsx
        </div>
        <div className="m-tree-item m-tree-file">&nbsp; package.json</div>
      </div>
    </div>
  );
}

function NewProjectPane({
  nameTyped,
  agentTyped,
  isCreating,
  nameFieldRef,
  agentFieldRef,
  createBtnRef,
}: {
  nameTyped: string;
  agentTyped: string;
  isCreating: boolean;
  nameFieldRef: React.Ref<HTMLDivElement>;
  agentFieldRef: React.Ref<HTMLDivElement>;
  createBtnRef: React.Ref<HTMLButtonElement>;
}) {
  return (
    <div className="m-pane m-newproject-pane">
      <div className="m-np-form">
        <div className="m-np-field" ref={nameFieldRef}>
          <span className="m-np-label">PROJECT NAME</span>
          <div className="m-np-input">
            {nameTyped}
            {agentTyped === "" && !isCreating && nameTyped.length > 0 && (
              <span className="m-cursor">|</span>
            )}
            {nameTyped === "" && agentTyped === "" && !isCreating && (
              <span className="m-np-placeholder">my-app</span>
            )}
          </div>
        </div>
        <div className="m-np-divider" />
        <div className="m-np-field" ref={agentFieldRef}>
          <span className="m-np-label">AGENT COMMAND</span>
          <div className="m-np-input">
            {agentTyped}
            {agentTyped.length > 0 && !isCreating && (
              <span className="m-cursor">|</span>
            )}
            {agentTyped === "" && !isCreating && (
              <span className="m-np-placeholder">claude</span>
            )}
          </div>
        </div>
        <div className="m-np-divider" />
        <div className="m-np-field">
          <div className="m-np-label-row">
            <span className="m-np-label">GITHUB REPO</span>
            <span className="m-np-optional">optional</span>
          </div>
          <div className="m-np-input">
            <span className="m-np-placeholder">https://github.com/owner/repo</span>
          </div>
        </div>
        <div className="m-np-divider" />
        <button
          ref={createBtnRef}
          className={`m-np-submit${isCreating ? " creating" : ""}`}
        >
          {isCreating ? "CREATING..." : "CREATE"}
        </button>
      </div>
    </div>
  );
}

// macOS-style cursor SVG
function CursorSVG() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.5 0.5L1.5 16.5L5.5 12.5L9 19.5L11.5 18.5L8 11.5L13.5 11.5L1.5 0.5Z"
        fill="white"
        stroke="#222"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Helper: sleep that respects cancellation
function sleep(ms: number, signal: { cancelled: boolean }): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (signal.cancelled) { resolve(false); return; }
      if (Date.now() - start >= ms) { resolve(true); return; }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

// Helper: get element center relative to container
function getRelPos(
  el: HTMLElement,
  container: HTMLElement
): { x: number; y: number } {
  const er = el.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  return {
    x: er.left - cr.left + er.width / 2,
    y: er.top - cr.top + er.height / 2,
  };
}

// Small random jitter
function jitter(v: number, range: number = 3): number {
  return v + (Math.random() - 0.5) * 2 * range;
}

export default function AppMockup() {
  const [activeTab, setActiveTab] = useState<Tab>("browser");
  const [view, setView] = useState<View>("project");
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(0);

  // Cursor state
  const [cursorPos, setCursorPos] = useState({ x: 300, y: 200 });
  const [clicking, setClicking] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Agent typing state
  const [typedLines, setTypedLines] = useState(AGENT_LINES.length);
  const [currentLineTyped, setCurrentLineTyped] = useState("");

  // New project form state
  const [npName, setNpName] = useState("");
  const [npAgent, setNpAgent] = useState("");
  const [npCreating, setNpCreating] = useState(false);

  // Refs for target elements
  const mockupRef = useRef<HTMLDivElement>(null);
  const newProjectBtnRef = useRef<HTMLButtonElement>(null);
  const agentTabRef = useRef<HTMLButtonElement>(null);
  const editorTabRef = useRef<HTMLButtonElement>(null);
  const browserTabRef = useRef<HTMLButtonElement>(null);
  const npNameRef = useRef<HTMLDivElement>(null);
  const npAgentRef = useRef<HTMLDivElement>(null);
  const npCreateBtnRef = useRef<HTMLButtonElement>(null);

  // Move cursor with transition
  const moveTo = useCallback(
    async (
      el: HTMLElement,
      signal: { cancelled: boolean },
      duration: number = 600
    ) => {
      if (!mockupRef.current || signal.cancelled) return;
      const pos = getRelPos(el, mockupRef.current);
      setCursorPos({ x: jitter(pos.x), y: jitter(pos.y) });
      await sleep(duration, signal);
    },
    []
  );

  // Click animation
  const doClick = useCallback(
    async (signal: { cancelled: boolean }) => {
      setClicking(true);
      await sleep(180, signal);
      setClicking(false);
      await sleep(100, signal);
    },
    []
  );

  // Type into a state setter character by character
  const typeText = useCallback(
    async (
      text: string,
      setter: (v: string) => void,
      signal: { cancelled: boolean },
      charDelay: number = 55
    ) => {
      for (let i = 0; i <= text.length; i++) {
        if (signal.cancelled) return;
        setter(text.slice(0, i));
        await sleep(charDelay + (Math.random() - 0.5) * 24, signal);
      }
    },
    []
  );

  // Reveal agent lines one at a time
  const typeAgentLines = useCallback(
    async (signal: { cancelled: boolean }) => {
      setTypedLines(0);
      setCurrentLineTyped("");

      for (let lineIdx = 0; lineIdx < AGENT_LINES.length; lineIdx++) {
        if (signal.cancelled) return;
        setCurrentLineTyped(AGENT_LINES[lineIdx].text);
        setTypedLines(lineIdx + 1);
        setCurrentLineTyped("");
        await sleep(120 + Math.random() * 80, signal);
      }
    },
    []
  );

  useEffect(() => {
    const signal = { cancelled: false };

    async function runLoop() {
      await sleep(500, signal);

      while (!signal.cancelled) {
        // Reset all state for loop start
        setView("project");
        setActiveTab("browser");
        setProjects(INITIAL_PROJECTS);
        setSelectedProject(0);
        setTypedLines(AGENT_LINES.length);
        setCurrentLineTyped("");
        setNpName("");
        setNpAgent("");
        setNpCreating(false);
        setCursorVisible(true);

        // Step 1: Initial pause
        await sleep(800, signal);
        if (signal.cancelled) break;

        // Step 2: Move to "+ new project" button and click → show form
        if (newProjectBtnRef.current && mockupRef.current) {
          await moveTo(newProjectBtnRef.current, signal, 700);
          if (signal.cancelled) break;
          await doClick(signal);
          setView("newProject");
          await sleep(400, signal);
          if (signal.cancelled) break;
        }

        // Step 3: Move to project name field and type
        if (npNameRef.current && mockupRef.current) {
          await moveTo(npNameRef.current, signal, 500);
          if (signal.cancelled) break;
          await doClick(signal);
          if (signal.cancelled) break;
          await typeText("synth", setNpName, signal);
          if (signal.cancelled) break;
          await sleep(300, signal);
        }

        // Step 4: Move to agent command field and type
        if (npAgentRef.current && mockupRef.current) {
          await moveTo(npAgentRef.current, signal, 400);
          if (signal.cancelled) break;
          await doClick(signal);
          if (signal.cancelled) break;
          await typeText("claude", setNpAgent, signal);
          if (signal.cancelled) break;
          await sleep(300, signal);
        }

        // Step 5: Move to CREATE button and click
        if (npCreateBtnRef.current && mockupRef.current) {
          await moveTo(npCreateBtnRef.current, signal, 500);
          if (signal.cancelled) break;
          await doClick(signal);
          setNpCreating(true);
          await sleep(800, signal);
          if (signal.cancelled) break;

          // Project created — land directly on agent tab
          setProjects(FULL_PROJECTS);
          setSelectedProject(0);
          setView("project");
          setActiveTab("agent");
          await sleep(400, signal);
          if (signal.cancelled) break;
        }

        // Step 6: Agent types (already on agent tab from creation)
        if (mockupRef.current) {
          const container = mockupRef.current;
          setCursorPos({
            x: jitter(container.offsetWidth * 0.55),
            y: jitter(container.offsetHeight * 0.55),
          });
          await sleep(400, signal);
          if (signal.cancelled) break;

          await typeAgentLines(signal);
          if (signal.cancelled) break;
          await sleep(600, signal);
        }

        // Step 7: Move to browser tab — see the result
        if (browserTabRef.current && mockupRef.current) {
          await moveTo(browserTabRef.current, signal, 600);
          if (signal.cancelled) break;
          await doClick(signal);
          setActiveTab("browser");
          await sleep(2000, signal);
          if (signal.cancelled) break;
        }

        // Step 8: Move to editor tab and click
        if (editorTabRef.current && mockupRef.current) {
          await moveTo(editorTabRef.current, signal, 600);
          if (signal.cancelled) break;
          await doClick(signal);
          setActiveTab("editor");
          await sleep(1400, signal);
          if (signal.cancelled) break;
        }
      }
    }

    runLoop();
    return () => {
      signal.cancelled = true;
    };
  }, [moveTo, doClick, typeText, typeAgentLines]);

  const showTabs = view === "project";

  return (
    <div className="mockup-window" ref={mockupRef}>
      {cursorVisible && (
        <div
          className={`m-animated-cursor${clicking ? " clicking" : ""}`}
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <CursorSVG />
        </div>
      )}

      <div className="m-body">
        {/* Sidebar */}
        <div className="mockup-sidebar">
          <button className="mockup-new-project" ref={newProjectBtnRef}>
            + new project
          </button>
          <div className="mockup-project-list">
            {projects.map((p, i) => (
              <div key={p.name}>
                <button
                  className={`mockup-project${i === selectedProject ? " selected" : ""}`}
                  onClick={() => setSelectedProject(i)}
                >
                  <span className="m-project-status">
                    {p.status === "running" ? (
                      <span className="mockup-dot" />
                    ) : (
                      <span className="m-dot-idle" />
                    )}
                  </span>
                  {p.name}
                </button>
                {i === selectedProject && p.terminals.length > 0 && (
                  <div className="m-terminals">
                    {p.terminals.map((t) => (
                      <div
                        key={t.label}
                        className={`m-terminal-item${t.active ? " active" : ""}`}
                      >
                        <span className="m-term-icon">&#9654;</span>
                        {t.label}
                      </div>
                    ))}
                    <div className="m-terminal-item m-new-term">
                      + new terminal
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="m-sidebar-footer">
            <span className="m-footer-icon" title="Logs">&#9776;</span>
            <span className="m-footer-icon" title="Archive">&#9744;</span>
            <span className="m-footer-icon" title="Settings">&#9881;</span>
          </div>
        </div>

        {/* Main area */}
        <div className="mockup-main">
          {showTabs && (
            <div className="mockup-tabs">
              {(["browser", "agent", "editor"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  ref={
                    tab === "agent"
                      ? agentTabRef
                      : tab === "editor"
                        ? editorTabRef
                        : tab === "browser"
                          ? browserTabRef
                          : undefined
                  }
                  className={`mockup-tab${activeTab === tab ? " active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span className="m-tab-icon">
                    {tab === "browser" && "○"}
                    {tab === "agent" && ">_"}
                    {tab === "editor" && "</>"}
                  </span>
                  {tab}
                </button>
              ))}
              {activeTab === "browser" && (
                <div className="m-urlbar-inline">
                  <div className="m-urlbar-input">
                    <span>localhost:3000</span>
                    <span className="m-urlbar-arrows">
                      <span className="m-arrow">&#8592;</span>
                      <span className="m-arrow">&#8594;</span>
                      <span className="m-arrow">&#8635;</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "newProject" && (
            <NewProjectPane
              nameTyped={npName}
              agentTyped={npAgent}
              isCreating={npCreating}
              nameFieldRef={npNameRef}
              agentFieldRef={npAgentRef}
              createBtnRef={npCreateBtnRef}
            />
          )}

          {showTabs && activeTab === "browser" && <BrowserPane />}
          {showTabs && activeTab === "agent" && (
            <AgentPane
              typedLines={typedLines}
              currentLineTyped={currentLineTyped}
            />
          )}
          {showTabs && activeTab === "editor" && <EditorPane />}

          <div className="m-statusbar">
            <span>{view === "newProject" ? "new project" : "synth"}</span>
            <span className="m-status-right">
              {view === "newProject" && "create a new project"}
              {showTabs && activeTab === "browser" && "localhost:3000 — 200 OK"}
              {showTabs && activeTab === "agent" && "claude — ready"}
              {showTabs && activeTab === "editor" && "oscillator.ts — 13 lines — utf-8"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
