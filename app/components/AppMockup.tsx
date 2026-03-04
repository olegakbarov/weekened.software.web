"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Tab = "browser" | "agent" | "editor";

const projects = [
  {
    name: "my-app",
    status: "running" as const,
    terminals: [{ label: "dev server", active: true }, { label: "claude" }],
  },
  { name: "landing-page", status: "idle" as const, terminals: [] },
  { name: "api-server", status: "idle" as const, terminals: [] },
];

const AGENT_LINES = [
  { prefix: "$", text: 'claude "add user auth to the app"', style: "cmd" },
  { prefix: "", text: "", style: "dim" },
  { prefix: "", text: "Reading project structure...", style: "dim" },
  { prefix: "", text: "Found 12 files in src/", style: "dim" },
  { prefix: "", text: "", style: "dim" },
  { prefix: "+", text: "Creating src/middleware/auth.ts", style: "green" },
  { prefix: "~", text: "Updating src/routes/index.ts", style: "yellow" },
  { prefix: "~", text: "Updating src/app.ts", style: "yellow" },
  { prefix: "+", text: "Adding jsonwebtoken dependency", style: "green" },
  { prefix: "", text: "", style: "dim" },
  { prefix: "✓", text: "Done. 3 files changed, 1 added.", style: "done" },
];

function BrowserPane() {
  return (
    <div className="m-pane">
      <div className="m-browser-page">
        <div className="m-page-nav">
          <span className="m-page-logo">&#9679; my-app</span>
          <span className="m-page-links">
            <span>home</span>
            <span>about</span>
            <span>api</span>
          </span>
        </div>
        <div className="m-page-hero">
          <div className="m-page-h1">Welcome to my-app</div>
          <div className="m-page-p">Built with Weekend Software</div>
          <div className="m-page-btn">get started</div>
        </div>
        <div className="m-page-cards">
          <div className="m-page-card">
            <div className="m-card-icon">&#9632;</div>
            <div className="m-card-label">fast</div>
          </div>
          <div className="m-page-card">
            <div className="m-card-icon">&#9650;</div>
            <div className="m-card-label">secure</div>
          </div>
          <div className="m-page-card">
            <div className="m-card-icon">&#9679;</div>
            <div className="m-card-label">simple</div>
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
          <span className="m-editor-file active">app.ts</span>
          <span className="m-editor-file">auth.ts</span>
        </div>
        <div className="m-editor-code">
          <div className="m-code-line">
            <span className="m-ln">1</span>
            <span className="m-kw">import</span>
            {" { serve } "}
            <span className="m-kw">from</span>
            <span className="m-str"> &quot;./server&quot;</span>;
          </div>
          <div className="m-code-line">
            <span className="m-ln">2</span>
            <span className="m-kw">import</span>
            {" { router } "}
            <span className="m-kw">from</span>
            <span className="m-str"> &quot;./routes&quot;</span>;
          </div>
          <div className="m-code-line">
            <span className="m-ln">3</span>
            <span className="m-kw">import</span>
            {" { auth } "}
            <span className="m-kw">from</span>
            <span className="m-str"> &quot;./middleware&quot;</span>;
          </div>
          <div className="m-code-line">
            <span className="m-ln">4</span>
          </div>
          <div className="m-code-line">
            <span className="m-ln">5</span>
            <span className="m-kw">const</span>
            {" app = "}
            <span className="m-fn">serve</span>
            {"({"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">6</span>
            {"  port: "}
            <span className="m-num">3000</span>,
          </div>
          <div className="m-code-line">
            <span className="m-ln">7</span>
            {"  middleware: ["}
            <span className="m-fn">auth</span>
            {"()],"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">8</span>
            {"  routes: router,"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">9</span>
            {"});"}
          </div>
          <div className="m-code-line">
            <span className="m-ln">10</span>
          </div>
          <div className="m-code-line">
            <span className="m-ln">11</span>
            {"console."}
            <span className="m-fn">log</span>(
            <span className="m-str">&quot;listening :3000&quot;</span>);
          </div>
        </div>
      </div>
      <div className="m-file-tree">
        <div className="m-tree-header">files</div>
        <div className="m-tree-item m-tree-dir">&#9660; src/</div>
        <div className="m-tree-item m-tree-file m-tree-active">
          &nbsp; app.ts
        </div>
        <div className="m-tree-item m-tree-file">
          &nbsp; server.ts
        </div>
        <div className="m-tree-item m-tree-file">
          &nbsp; routes.ts
        </div>
        <div className="m-tree-item m-tree-dir">&#9660; middleware/</div>
        <div className="m-tree-item m-tree-file m-tree-new">
          &nbsp;&nbsp; auth.ts
        </div>
        <div className="m-tree-item m-tree-dir">&#9654; public/</div>
        <div className="m-tree-item m-tree-file">&nbsp; package.json</div>
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
  const [selectedProject, setSelectedProject] = useState(0);

  // Cursor state
  const [cursorPos, setCursorPos] = useState({ x: 300, y: 200 });
  const [clicking, setClicking] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Agent typing state
  const [typedLines, setTypedLines] = useState(AGENT_LINES.length);
  const [currentLineTyped, setCurrentLineTyped] = useState("");

  // Refs for target elements
  const mockupRef = useRef<HTMLDivElement>(null);
  const newProjectBtnRef = useRef<HTMLButtonElement>(null);
  const agentTabRef = useRef<HTMLButtonElement>(null);
  const editorTabRef = useRef<HTMLButtonElement>(null);
  const browserTabRef = useRef<HTMLButtonElement>(null);

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

  // Type text character by character into the agent pane
  const typeAgentLines = useCallback(
    async (signal: { cancelled: boolean }) => {
      setTypedLines(0);
      setCurrentLineTyped("");

      for (let lineIdx = 0; lineIdx < AGENT_LINES.length; lineIdx++) {
        if (signal.cancelled) return;
        const line = AGENT_LINES[lineIdx];
        const fullText = line.text;

        // Type each character
        for (let ci = 0; ci <= fullText.length; ci++) {
          if (signal.cancelled) return;
          setCurrentLineTyped(fullText.slice(0, ci));
          const charDelay = 38 + (Math.random() - 0.5) * 20;
          await sleep(charDelay, signal);
        }

        // Commit line
        setTypedLines(lineIdx + 1);
        setCurrentLineTyped("");

        // Small pause between lines
        await sleep(80 + Math.random() * 60, signal);
      }
    },
    []
  );

  useEffect(() => {
    const signal = { cancelled: false };

    async function runLoop() {
      // Wait for mount
      await sleep(500, signal);

      while (!signal.cancelled) {
        // Reset state for loop start
        setActiveTab("browser");
        setTypedLines(AGENT_LINES.length);
        setCurrentLineTyped("");
        setCursorVisible(true);

        // Step 1: Initial pause
        await sleep(800, signal);
        if (signal.cancelled) break;

        // Step 2: Move to "+ new project" button and click
        if (newProjectBtnRef.current && mockupRef.current) {
          await moveTo(newProjectBtnRef.current, signal, 700);
          if (signal.cancelled) break;
          await doClick(signal);
          if (signal.cancelled) break;
        }

        // Step 3: Move to agent tab and click
        if (agentTabRef.current && mockupRef.current) {
          await moveTo(agentTabRef.current, signal, 600);
          if (signal.cancelled) break;
          await doClick(signal);
          setActiveTab("agent");
          await sleep(300, signal);
          if (signal.cancelled) break;
        }

        // Step 4: Move into terminal area and type
        if (mockupRef.current) {
          // Move cursor into the terminal area (roughly center of pane)
          const container = mockupRef.current;
          setCursorPos({
            x: jitter(container.offsetWidth * 0.55),
            y: jitter(container.offsetHeight * 0.55),
          });
          await sleep(500, signal);
          if (signal.cancelled) break;

          await typeAgentLines(signal);
          if (signal.cancelled) break;
          await sleep(400, signal);
        }

        // Step 5: Move to editor tab and click
        if (editorTabRef.current && mockupRef.current) {
          await moveTo(editorTabRef.current, signal, 600);
          if (signal.cancelled) break;
          await doClick(signal);
          setActiveTab("editor");
          await sleep(1200, signal);
          if (signal.cancelled) break;
        }

        // Step 6: Move to browser tab and click
        if (browserTabRef.current && mockupRef.current) {
          await moveTo(browserTabRef.current, signal, 600);
          if (signal.cancelled) break;
          await doClick(signal);
          setActiveTab("browser");
          await sleep(1800, signal);
          if (signal.cancelled) break;
        }

        // Loop back
      }
    }

    runLoop();
    return () => {
      signal.cancelled = true;
    };
  }, [moveTo, doClick, typeAgentLines]);

  return (
    <div className="mockup-window" ref={mockupRef}>
      {/* Animated cursor */}
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

          {activeTab === "browser" && <BrowserPane />}
          {activeTab === "agent" && (
            <AgentPane
              typedLines={typedLines}
              currentLineTyped={currentLineTyped}
            />
          )}
          {activeTab === "editor" && <EditorPane />}

          <div className="m-statusbar">
            <span>my-app</span>
            <span className="m-status-right">
              {activeTab === "browser" && "localhost:3000 — 200 OK"}
              {activeTab === "agent" && "claude — ready"}
              {activeTab === "editor" && "app.ts — 11 lines — utf-8"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
