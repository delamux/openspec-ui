/* global React, ReactDOM */
const { useState, useEffect, useMemo, useRef } = React;

/* ----------------------------------------------------------------------------
   Tiny markdown renderer — headings, bold, inline code, fenced code,
   blockquote, unordered lists, and pipe tables. Enough for spec docs.
---------------------------------------------------------------------------- */
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inlineMd(s) {
  s = escapeHtml(s);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return s;
}
function mdToHtml(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const isTableSep = (l) => /^\s*\|?[\s:|-]+\|[\s:|-]+/.test(l) && l.includes("-");
  while (i < lines.length) {
    let line = lines[i];

    // fenced code
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // closing fence
      out.push("<pre><code>" + escapeHtml(buf.join("\n")) + "</code></pre>");
      continue;
    }
    // headings
    let m = /^(#{1,4})\s+(.*)$/.exec(line);
    if (m) {
      const lvl = m[1].length;
      out.push(`<h${lvl}>${inlineMd(m[2])}</h${lvl}>`);
      i++;
      continue;
    }
    // blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, "")); i++;
      }
      out.push("<blockquote><p>" + inlineMd(buf.join(" ")) + "</p></blockquote>");
      continue;
    }
    // table
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const splitRow = (l) =>
        l.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) { rows.push(splitRow(lines[i])); i++; }
      let t = "<table><thead><tr>";
      head.forEach((h) => (t += `<th>${inlineMd(h)}</th>`));
      t += "</tr></thead><tbody>";
      rows.forEach((r) => {
        t += "<tr>";
        r.forEach((c) => (t += `<td>${inlineMd(c)}</td>`));
        t += "</tr>";
      });
      t += "</tbody></table>";
      out.push(t);
      continue;
    }
    // unordered / ordered list
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const buf = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, "")); i++;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>` + buf.map((b) => `<li>${inlineMd(b)}</li>`).join("") + `</${tag}>`);
      continue;
    }
    // blank
    if (/^\s*$/.test(line)) { i++; continue; }
    // paragraph
    const buf = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,4})\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i])
    ) { buf.push(lines[i]); i++; }
    out.push("<p>" + inlineMd(buf.join(" ")) + "</p>");
  }
  return out.join("\n");
}

function Markdown({ source }) {
  const html = useMemo(() => mdToHtml(source), [source]);
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------------------------------------------------------------------------- Icons (inline, stroke-based — shadcn/lucide feel) */
const Icon = ({ d, size = 16, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    {d}
  </svg>
);
const IconProposal = (p) => <Icon {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></>} />;
const IconDesign = (p) => <Icon {...p} d={<><path d="m12 19 7-7 3 3-7 7-3-3z" /><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="m2 2 7.586 7.586" /><circle cx="11" cy="11" r="2" /></>} />;
const IconTasks = (p) => <Icon {...p} d={<><path d="M11 12H3" /><path d="M16 6H3" /><path d="M16 18H3" /><path d="m17 12 2 2 4-4" /></>} />;
const IconSun = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>} />;
const IconMoon = (p) => <Icon {...p} d={<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />} />;
const IconPlus = (p) => <Icon {...p} d={<><path d="M5 12h14" /><path d="M12 5v14" /></>} />;
const IconTrash = (p) => <Icon {...p} d={<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>} />;
const IconCheck = (p) => <Icon {...p} d={<path d="M20 6 9 17l-5-5" />} />;
const IconComment = (p) => <Icon {...p} d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />;
const IconSend = (p) => <Icon {...p} d={<><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>} />;

/* ---------------------------------------------------------------------------- Tabs definition */
const TABS = [
  { id: "proposal", label: "Proposal", icon: IconProposal },
  { id: "design", label: "Design", icon: IconDesign },
  { id: "tasks", label: "Tasks", icon: IconTasks },
];

/* ---------------------------------------------------------------------------- Tasks tab */
function CommentThread({ task, onAdd }) {
  const [draft, setDraft] = useState("");
  const comments = task.comments || [];
  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  };
  return (
    <div className="thread">
      {comments.map((c) => (
        <div className="comment" key={c.id}>
          <div className="avatar" aria-hidden="true">{c.initials}</div>
          <div className="comment-body">
            <div className="comment-meta">
              <span className="comment-author">{c.author}</span>
              <span className="comment-when">{c.when}</span>
            </div>
            <div className="comment-text">{c.text}</div>
          </div>
        </div>
      ))}
      <div className="comment-composer">
        <div className="avatar avatar-you" aria-hidden="true">YO</div>
        <input
          value={draft}
          placeholder="Add a comment…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
        <button className="comment-send" aria-label="Post comment" disabled={!draft.trim()} onClick={submit}>
          <IconSend size={14} />
        </button>
      </div>
    </div>
  );
}

function TasksView({ groups, setGroups }) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(() => new Set());
  const all = groups.flatMap((g) => g.items);
  const doneCount = all.filter((t) => t.done).length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;

  const toggleOpen = (id) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggle = (gi, ii) =>
    setGroups((gs) => gs.map((g, x) => x !== gi ? g : {
      ...g, items: g.items.map((t, y) => y !== ii ? t : { ...t, done: !t.done }),
    }));
  const remove = (gi, ii) =>
    setGroups((gs) => gs.map((g, x) => x !== gi ? g : {
      ...g, items: g.items.filter((_, y) => y !== ii),
    }));
  const addComment = (gi, ii, text) =>
    setGroups((gs) => gs.map((g, x) => x !== gi ? g : {
      ...g,
      items: g.items.map((t, y) => y !== ii ? t : {
        ...t,
        comments: [...(t.comments || []), { id: "c" + Date.now(), author: "You", initials: "YO", when: "just now", text }],
      }),
    }));
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setGroups((gs) => {
      const next = gs.map((g) => ({ ...g, items: [...g.items] }));
      const last = next[next.length - 1];
      const n = last.items.length + 1;
      last.items.push({ id: `${next.length}.${n}`, text, done: false, comments: [] });
      return next;
    });
    setDraft("");
  };

  return (
    <div className="tasks">
      <div className="progress-card">
        <div className="progress-head">
          <span className="progress-label">Implementation progress</span>
          <span className="progress-count"><strong>{doneCount}</strong> / {all.length} · {pct}%</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: pct + "%" }} /></div>
      </div>

      {groups.map((g, gi) => (
        <div className="task-group" key={gi}>
          <div className="task-group-title">{g.title}</div>
          <ul className="task-list">
            {g.items.map((t, ii) => {
              const count = (t.comments || []).length;
              const isOpen = open.has(t.id);
              return (
                <li className={"task" + (t.done ? " is-done" : "") + (isOpen ? " is-open" : "")} key={t.id}>
                  <div className="task-row">
                    <button className="check" role="checkbox" aria-checked={t.done}
                      onClick={() => toggle(gi, ii)}>
                      {t.done && <IconCheck size={12} />}
                    </button>
                    <span className="task-id">{t.id}</span>
                    <span className="task-text">{t.text}</span>
                    <div className="task-actions">
                      <button
                        className={"task-comment" + (count ? " has-count" : "")}
                        aria-label={count ? `${count} comments` : "Add comment"}
                        aria-expanded={isOpen}
                        onClick={() => toggleOpen(t.id)}>
                        <IconComment size={14} />
                        {count > 0 && <span className="comment-count">{count}</span>}
                      </button>
                      <button className="task-del" aria-label="Delete task" onClick={() => remove(gi, ii)}>
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                  {isOpen && <CommentThread task={t} onAdd={(text) => addComment(gi, ii, text)} />}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="task-add">
        <input value={draft} placeholder="Add a task…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="btn-add" onClick={add}><IconPlus size={14} /> Add</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------- Tab nav (variant-aware) */
function TabNav({ variant, active, setActive }) {
  return (
    <nav className={"tabnav tabnav-" + variant} role="tablist">
      {TABS.map((t) => {
        const I = t.icon;
        return (
          <button key={t.id} role="tab" aria-selected={active === t.id}
            className={"tab" + (active === t.id ? " is-active" : "")}
            onClick={() => setActive(t.id)}>
            <I size={16} /><span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------------------------------------------------------------------- App */
function App({ variant = "a", device = "desktop", initialTheme = "system" }) {
  const spec = window.SPEC;
  const [active, setActive] = useState("proposal");
  const [groups, setGroups] = useState(spec.tasks);
  const [theme, setTheme] = useState(() => {
    if (initialTheme === "system")
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return initialTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const all = groups.flatMap((g) => g.items);
  const taskPct = all.length ? Math.round((all.filter((t) => t.done).length / all.length) * 100) : 0;

  const header = (
    <header className="appbar">
      <div className="brand">
        <div className="logo">
          <svg viewBox="0 0 32 32" width="17" height="17" aria-hidden="true">
            <path d="M16 6 26 16 16 26 6 16Z" fill="currentColor" />
            <path d="M16 12 20 16 16 20 12 16Z" fill="var(--primary)" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-name">{spec.meta.change}</div>
          <div className="brand-sub">{spec.meta.title}</div>
        </div>
      </div>
      <div className="appbar-right">
        <span className="status-badge">{spec.meta.status}</span>
        <button className="icon-btn" aria-label="Toggle theme"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
      </div>
    </header>
  );

  const content = (
    <div className="content" role="tabpanel">
      {active === "proposal" && <Markdown source={spec.proposal} />}
      {active === "design" && <Markdown source={spec.design} />}
      {active === "tasks" && <TasksView groups={groups} setGroups={setGroups} />}
    </div>
  );

  // Variant C uses a segmented control centered above a reading column.
  // Variant B uses a left sidebar (collapses to top on mobile).
  const sidebarMode = variant === "b" && device !== "mobile";

  return (
    <div className={`app app-${variant} device-${device}`}>
      {header}
      {sidebarMode ? (
        <div className="body-split">
          <aside className="sidebar">
            <div className="sidebar-label">Spec</div>
            <TabNav variant={variant} active={active} setActive={setActive} />
            <div className="sidebar-foot">
              <div className="mini-progress">
                <div className="mini-progress-track"><div className="mini-progress-fill" style={{ width: taskPct + "%" }} /></div>
                <span>{taskPct}% done</span>
              </div>
              <div className="meta-line">@{spec.meta.author}</div>
              <div className="meta-line">Updated {spec.meta.updated}</div>
            </div>
          </aside>
          <main className="main-scroll">{content}</main>
        </div>
      ) : (
        <>
          <div className="tabbar-wrap">
            <TabNav variant={variant} active={active} setActive={setActive} />
          </div>
          <main className="main-scroll">{content}</main>
        </>
      )}
    </div>
  );
}

window.OpenSpecApp = App;
