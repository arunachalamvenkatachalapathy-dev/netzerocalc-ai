import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FileUp,
  Filter,
  Globe,
  Info,
  Layers,
  Leaf,
  Maximize2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  Sliders,
  Sparkles,
  Trash2,
  X,
  Zap
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
// No login flow is wired into this component yet -- approve/override calls
// need SOME user_id, and the backend tolerates an unrecognized one by storing
// null rather than erroring, so this is a placeholder until real auth is
// wired into the UI, not a finished feature.
const DEMO_USER_ID = "frontend-demo-user";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectName, setProjectName] = useState("EV Battery Assembly Line");
  const [geo, setGeo] = useState("US");
  const [year, setYear] = useState(2024);
  const [source, setSource] = useState("USLCI");
  
  const [projectId, setProjectId] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loadError, setLoadError] = useState(null);

  // Real project creation + audit fetch, replacing what used to be four
  // hardcoded mock rows that looked identical to real data but weren't --
  // this now actually calls the backend built earlier in this project.
  useEffect(() => {
    async function initProject() {
      try {
        const res = await fetch(`${API}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_name: projectName,
            default_target_geography: geo,
            default_target_year: year
          })
        });
        if (!res.ok) throw new Error(`Project creation failed: ${res.status}`);
        const project = await res.json();
        setProjectId(project.id);
        const auditsRes = await fetch(`${API}/bom/audits/${project.id}`);
        if (auditsRes.ok) setAudits(await auditsRes.json());
      } catch (err) {
        setLoadError(
          `Could not reach the backend at ${API}. Is it running? (${err.message})`
        );
      }
    }
    initProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [expanded, setExpanded] = useState(null);
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [overrideNotes, setOverrideNotes] = useState({});
  const [message, setMessage] = useState("");

  // Modals & Drawers
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedPedigree, setSelectedPedigree] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");

  // What-If Simulator State
  const [simRecycledPct, setSimRecycledPct] = useState(65);
  const [simRenewableEnergyPct, setSimRenewableEnergyPct] = useState(80);

  // Assistant messages
  const [botQuestion, setBotQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome! I am your AI Review Assistant. Ask me about DQR scores, removal options, or carbon credit calculations."
    }
  ]);

  const [manual, setManual] = useState({ description: "", quantity: 50, unit: "kg" });

  // Filtered Audits
  const visibleAudits = useMemo(() => {
    let rows = audits;
    if (riskFilter !== "ALL") {
      rows = rows.filter((r) => r.audit_risk_level === riskFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.raw_bom_input?.toLowerCase().includes(q) ||
          r.matched_process_name?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [audits, riskFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = audits.length;
    const highRisk = audits.filter((a) => a.audit_risk_level === "HIGH").length;
    const approved = audits.filter((a) => a.is_human_approved).length;
    const progress = total > 0 ? Math.round((approved / total) * 100) : 0;
    
    // Uses the real result_tco2e computed server-side (quantity * verified
    // factor / 1000) -- the previous version multiplied by a hardcoded
    // fallback constant (1.5) whenever a row had no factor, which meant it
    // could show a nonzero "total footprint" even for completely unmatched
    // or placeholder rows. Now unmatched/null rows correctly contribute 0.
    const totalCo2eTons = audits
      .reduce((acc, item) => acc + (item.result_tco2e || 0), 0)
      .toFixed(3);
    const placeholderCount = audits.filter(
      (a) => a.matched_data_quality_status === "placeholder"
    ).length;

    return { total, highRisk, approved, progress, totalCo2eTons, placeholderCount };
  }, [audits]);

  // What-If Simulation Calculations
  const simResults = useMemo(() => {
    const baseCo2e = Number(stats.totalCo2eTons);
    const reductionFactor = (simRecycledPct * 0.4 + simRenewableEnergyPct * 0.45) / 100;
    const avoidedCo2eTons = (baseCo2e * reductionFactor).toFixed(2);
    const creditDollarValue = (avoidedCo2eTons * 35).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });

    return { baseCo2e, avoidedCo2eTons, creditDollarValue };
  }, [stats.totalCo2eTons, simRecycledPct, simRenewableEnergyPct]);

  // Actions
  async function approveRow(id) {
    try {
      const res = await fetch(`${API}/bom/audits/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: DEMO_USER_ID, notes: "Approved in review" })
      });
      if (!res.ok) throw new Error(`Approve failed: ${res.status}`);
      const updated = await res.json();
      setAudits((rows) => rows.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setMessage(`Approve failed: ${err.message}`);
    }
  }

  async function overrideRow(id, processId, candidateName) {
    try {
      const res = await fetch(`${API}/bom/audits/${id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: DEMO_USER_ID,
          process_id: processId,
          notes: `Reviewer selected "${candidateName}" from the candidate list instead of the auto-picked match.`
        })
      });
      if (!res.ok) throw new Error(`Override failed: ${res.status}`);
      const updated = await res.json();
      setAudits((rows) => rows.map((item) => (item.id === id ? updated : item)));
      setMessage(`Switched match to "${candidateName}".`);
    } catch (err) {
      setMessage(`Override failed: ${err.message}`);
    }
  }

  function removeRow(id) {
    setAudits((rows) => rows.filter((item) => item.id !== id));
    if (expanded === id) setExpanded(null);
    setMessage("Item removed from active BOM queue.");
  }

  function approveAllLow() {
    setAudits((rows) =>
      rows.map((item) =>
        item.audit_risk_level === "LOW" ? { ...item, is_human_approved: true } : item
      )
    );
    setMessage("Approved all LOW-risk items.");
  }

  function clearAllWorkspace() {
    if (window.confirm("Remove all items from current workspace?")) {
      setAudits([]);
      setMessage("Workspace cleared.");
    }
  }

  async function addManualRow() {
    if (!manual.description.trim() || !projectId) return;
    setMessage("Matching against " + source + "...");
    try {
      const res = await fetch(`${API}/bom/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          raw_bom_input: manual.description,
          quantity: Number(manual.quantity),
          unit: manual.unit,
          required_unit: manual.unit,
          target_geography: geo,
          target_year: year,
          database_source: source,
          system_model: source === "India_GHG_Factors" ? "Direct Factor" : "Cut-off"
        })
      });
      if (!res.ok) throw new Error(`Match failed: ${res.status}`);
      const newRow = await res.json();
      setAudits((prev) => [newRow, ...prev]);
      setManual({ description: "", quantity: 50, unit: "kg" });
      setActiveTab("queue");
      setMessage(
        newRow.matched_process_name
          ? `Matched to "${newRow.matched_process_name}" (${newRow.audit_risk_level} risk)`
          : "No candidate found for that unit/source combination."
      );
    } catch (err) {
      setMessage(`Match request failed: ${err.message}`);
    }
  }

  function submitAssistant() {
    if (!botQuestion.trim()) return;
    const answer = `Analysis for "${botQuestion}":\n• Workspace has ${audits.length} items. Total footprint: ${stats.totalCo2eTons} tCO₂e.\n• Use the "🗑 Remove" button on any row to delete items not required in your project calculation.`;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: botQuestion },
      { role: "assistant", text: answer }
    ]);
    setBotQuestion("");
    setAssistantOpen(true);
  }

  return (
    <main className={sidebarCollapsed ? "collapsed" : ""}>
      {/* Sticky Top Navbar */}
      <header className="topbar">
        <div className="brand-title">
          <button className="btn-outline" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle Sidebar">
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <Zap size={22} style={{ color: "var(--accent-emerald)" }} />
          <span>BOM-to-LCI Semantic Mapper</span>
          <span className="brand-badge">E-Credits Enterprise</span>
        </div>

        <div className="top-actions">
          <button className="btn-primary" onClick={() => setCertModalOpen(true)}>
            <Award size={16} /> Certificate & E-Credits
          </button>
          <button className="btn-indigo" onClick={() => setAssistantOpen(true)}>
            <Bot size={16} /> AI Review Assistant
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside>
        <h1>Workspace Controls</h1>
        <div className="legal-notice">
          <strong>
            BYOL Decision-Support <span className="info-icon" data-tooltip="Bring Your Own License framework for client ecoinvent deployment">ⓘ</span>
          </strong>
          <p>Practitioner review required for regulated carbon credit reporting.</p>
        </div>

        <div className="form-group">
          <label>
            Project Name <span className="info-icon" data-tooltip="Name of target product BOM or facility manufacturing line">ⓘ</span>
          </label>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </div>

        <div className="grid2">
          <div className="form-group">
            <label>
              Geography <span className="info-icon" data-tooltip="Target ISO country or macro-region electricity grid context">ⓘ</span>
            </label>
            <select value={geo} onChange={(e) => setGeo(e.target.value)}>
              <option>US</option>
              <option>GLO</option>
              <option>EU</option>
              <option>IN</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              Target Year <span className="info-icon" data-tooltip="Operating year for grid emissions factor temporal validity">ⓘ</span>
            </label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>
            Database Source <span className="info-icon" data-tooltip="Selected LCI background database: USLCI, ELCD, Agribalyse, or private ecoinvent BYOL">ⓘ</span>
          </label>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option>USLCI</option>
            <option>ELCD</option>
            <option>Agribalyse Core</option>
            <option>ecoinvent BYOL private</option>
            <option value="India_GHG_Factors">India GHG Factors (60 factors, provenance-tagged)</option>
          </select>
        </div>

        <button className="btn-primary">
          <Check size={16} /> Project Active
        </button>

        <label className="upload-btn">
          <FileUp size={16} /> Upload BOM (CSV/XLSX)
          <input type="file" accept=".csv,.xlsx" />
        </label>

        <div className="status-box">
          <strong>Status:</strong>
          <p>{audits.length} BOM lines active in workspace.</p>
        </div>
      </aside>

      {/* Main Fluid Workspace */}
      <section>
        {/* KPI Dashboard */}
        <div className="kpi-dashboard">
          <div className="kpi-card">
            <div className="kpi-title">
              Total Carbon Footprint <span className="info-icon" data-tooltip="Scope 3 raw material & energy carbon intensity total">ⓘ</span>
            </div>
            <div className="kpi-value">{stats.totalCo2eTons} <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>tCO₂e</span></div>
          </div>

          <div className="kpi-card high-risk">
            <div className="kpi-title">
              High Risk Flags <span className="info-icon" data-tooltip="Line items requiring practitioner transformation step or process chaining">ⓘ</span>
            </div>
            <div className="kpi-value" style={{ color: "var(--risk-high)" }}>{stats.highRisk}</div>
          </div>

          <div className="kpi-card dqr-card">
            <div className="kpi-title">
              E-Credit Value <span className="info-icon" data-tooltip="Calculated carbon credit yield based on avoided emissions at $35/tCO2e">ⓘ</span>
            </div>
            <div className="kpi-value" style={{ color: "var(--accent-indigo)" }}>{simResults.creditDollarValue}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              Audit Progress <span className="info-icon" data-tooltip="Percentage of active BOM items practitioner-approved">ⓘ</span>
            </div>
            <div className="kpi-value">{stats.progress}%</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${stats.progress}%` }} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button className={`tab-btn ${activeTab === "queue" ? "active" : ""}`} onClick={() => setActiveTab("queue")}>
            Review Queue ({visibleAudits.length})
          </button>
          <button className={`tab-btn ${activeTab === "simulator" ? "active" : ""}`} onClick={() => setActiveTab("simulator")}>
            <Sliders size={14} /> What-If Scenario Simulator
          </button>
          <button className={`tab-btn ${activeTab === "compliance" ? "active" : ""}`} onClick={() => setActiveTab("compliance")}>
            <ShieldCheck size={14} /> CBAM & EU DPP Compliance
          </button>
          <button className={`tab-btn ${activeTab === "catalog" ? "active" : ""}`} onClick={() => setActiveTab("catalog")}>
            <Database size={14} /> LCI Datasets Catalog
          </button>
          <button className={`tab-btn ${activeTab === "manual" ? "active" : ""}`} onClick={() => setActiveTab("manual")}>
            <Plus size={14} /> Add BOM Item
          </button>
        </div>

        {/* TAB 1: Review Queue */}
        {activeTab === "queue" && (
          <>
            <div className="workspace-toolbar">
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ position: "relative", width: "240px" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "12px", color: "var(--text-muted)" }} />
                  <input
                    style={{ paddingLeft: "32px", height: "36px" }}
                    placeholder="Search BOM items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  {["ALL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
                    <button
                      key={risk}
                      className={`filter-btn ${riskFilter === risk ? "selected" : ""}`}
                      onClick={() => setRiskFilter(risk)}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn-primary" onClick={approveAllLow} style={{ height: "36px" }}>
                  <CheckCircle2 size={14} /> Approve All Low Risk
                </button>
                <button className="btn-danger" onClick={clearAllWorkspace} style={{ height: "36px" }}>
                  <Trash2 size={14} /> Clear Workspace
                </button>
              </div>
            </div>

            <div className="table-container">
              <div className="table-header">
                <span></span>
                <span>
                  BOM Input Line <span className="info-icon" data-tooltip="Raw component description and quantity">ⓘ</span>
                </span>
                <span>
                  Matched LCI Process <span className="info-icon" data-tooltip="Vector embedding nearest process match in target database">ⓘ</span>
                </span>
                <span>
                  Similarity <span className="info-icon" data-tooltip="Cosine vector similarity score">ⓘ</span>
                </span>
                <span>
                  DQR Pedigree <span className="info-icon" data-tooltip="Technological, Geographical, and Temporal score pills (1=Best, 5=Worst)">ⓘ</span>
                </span>
                <span>Risk</span>
                <span>
                  Decision Actions <span className="info-icon" data-tooltip="Approve mapping or Remove item if not required">ⓘ</span>
                </span>
              </div>

              {visibleAudits.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  No BOM items matching criteria. Upload a file or add a new item.
                </div>
              ) : (
                visibleAudits.map((row) => (
                  <React.Fragment key={row.id}>
                    <div className="table-row">
                      <button
                        className="btn-outline"
                        style={{ height: "28px", width: "28px", padding: 0 }}
                        onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                      >
                        {expanded === row.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      <div className="bom-name">
                        <span>{row.raw_bom_input}</span>
                        <span className="bom-sub">
                          {row.raw_bom_quantity} {row.raw_bom_unit} •{" "}
                          {row.result_tco2e !== null && row.result_tco2e !== undefined
                            ? `${row.result_tco2e.toFixed(4)} tCO₂e`
                            : "no factor — cannot compute"}
                        </span>
                      </div>

                      <div className="matched-process">
                        {row.matched_process_name || <em>No match found</em>}
                        {row.matched_data_quality_status && (
                          <span
                            className={`dq-badge dq-${row.matched_data_quality_status}`}
                            title={row.mandatory_data_gap_warning || ""}
                          >
                            {row.matched_data_quality_status}
                          </span>
                        )}
                      </div>

                      <div className="similarity-badge">
                        {row.vector_similarity_score != null
                          ? `${(row.vector_similarity_score * 100).toFixed(1)}%`
                          : "—"}
                      </div>

                      <div className="dqr-group" onClick={() => setSelectedPedigree(row)} title="Click for DQR Pedigree Matrix">
                        <span className={`dqr-pill dqr-${row.dqr_technological_score}`}>{row.dqr_technological_score}</span>
                        <span className={`dqr-pill dqr-${row.dqr_geographical_score}`}>{row.dqr_geographical_score}</span>
                        <span className={`dqr-pill dqr-${row.dqr_temporal_score}`}>{row.dqr_temporal_score}</span>
                      </div>

                      <div>
                        <span className={`risk-badge ${row.audit_risk_level}`}>{row.audit_risk_level}</span>
                      </div>

                      <div className="action-cell">
                        {row.is_human_approved ? (
                          <span style={{ color: "var(--accent-emerald)", fontWeight: 700, fontSize: "12px" }}>
                            <Check size={14} style={{ display: "inline" }} /> Approved
                          </span>
                        ) : (
                          <button className="btn-action-approve" onClick={() => approveRow(row.id)}>
                            Approve
                          </button>
                        )}
                        <button className="btn-action-remove" onClick={() => removeRow(row.id)} title="Remove item if not required">
                          <Trash2 size={13} style={{ display: "inline" }} /> Remove
                        </button>
                      </div>
                    </div>

                    {expanded === row.id && (
                      <div style={{ padding: "16px 20px 16px 68px", background: "rgba(11, 15, 25, 0.6)", borderBottom: "1px solid var(--border-light)" }}>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                          <strong>Audit Reasoning:</strong> {row.audit_reasoning}
                        </p>
                        {row.mandatory_data_gap_warning && (
                          <div style={{ padding: "10px 14px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "6px", color: "#fecdd3", fontSize: "13px", marginBottom: "10px" }}>
                            <AlertTriangle size={16} style={{ display: "inline", marginRight: "8px" }} />
                            {row.mandatory_data_gap_warning}
                          </div>
                        )}

                        {row.candidate_options && row.candidate_options.length > 1 && (
                          <div style={{ marginBottom: "12px" }}>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                              <strong>Alternative matches</strong> — click to switch instead of accepting the auto-pick:
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {row.candidate_options.map((c) => (
                                <button
                                  key={c.process_id}
                                  onClick={() => overrideRow(row.id, c.process_id, c.process_name)}
                                  disabled={c.process_id === row.matched_process_id}
                                  className="candidate-chip"
                                  style={{
                                    fontSize: "11px",
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-light)",
                                    background: c.process_id === row.matched_process_id ? "var(--accent-emerald)" : "transparent",
                                    color: c.process_id === row.matched_process_id ? "#031b12" : "var(--text-secondary)",
                                    cursor: c.process_id === row.matched_process_id ? "default" : "pointer"
                                  }}
                                  title={`${c.data_quality_status || "unknown"} • factor ${c.emission_factor ?? "n/a"}`}
                                >
                                  {c.process_name} · {(c.similarity_score * 100).toFixed(0)}%
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <button className="btn-danger" style={{ height: "30px", fontSize: "12px" }} onClick={() => removeRow(row.id)}>
                          <Trash2 size={13} /> Remove Item from BOM
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </>
        )}

        {/* TAB 2: What-If Simulator */}
        {activeTab === "simulator" && (
          <div className="panel-card">
            <div className="panel-title">
              <Sliders size={20} style={{ color: "var(--accent-emerald)" }} /> What-If Material & Renewable Energy Simulator
            </div>

            <div className="grid2">
              <div className="simulator-box">
                <label>Recycled Material Substitution (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simRecycledPct}
                  onChange={(e) => setSimRecycledPct(Number(e.target.value))}
                />
                <span style={{ fontSize: "14px", color: "var(--accent-emerald)", fontWeight: 700 }}>
                  {simRecycledPct}% Recycled Content
                </span>

                <label style={{ marginTop: "16px" }}>Clean Energy PPA (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simRenewableEnergyPct}
                  onChange={(e) => setSimRenewableEnergyPct(Number(e.target.value))}
                />
                <span style={{ fontSize: "14px", color: "var(--accent-cyan)", fontWeight: 700 }}>
                  {simRenewableEnergyPct}% Renewable Grid
                </span>
              </div>

              <div className="simulator-box">
                <strong>Impact Projections:</strong>
                <div className="sim-metric">
                  <span>Baseline CO₂e Footprint</span>
                  <span style={{ fontWeight: 700 }}>{stats.totalCo2eTons} tCO₂e</span>
                </div>
                <div className="sim-metric">
                  <span>Simulated Avoided Carbon</span>
                  <span style={{ color: "var(--accent-emerald)", fontWeight: 800 }}>{simResults.avoidedCo2eTons} tCO₂e</span>
                </div>
                <div className="sim-metric">
                  <span>E-Credit Dollar Valuation</span>
                  <span style={{ color: "var(--accent-indigo)", fontWeight: 800 }}>{simResults.creditDollarValue}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Compliance */}
        {activeTab === "compliance" && (
          <div className="panel-card">
            <div className="panel-title">
              <ShieldCheck size={20} style={{ color: "var(--accent-emerald)" }} /> Regulatory Compliance Screening Engine
            </div>
            <div className="grid3">
              <div style={{ background: "var(--bg-surface)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-light)" }}>
                <strong style={{ color: "#fff" }}>EU CBAM Readiness</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "6px 0 12px" }}>Carbon Border Adjustment Mechanism embedded carbon verification.</p>
                <span className="brand-badge">Verified Compliant</span>
              </div>
              <div style={{ background: "var(--bg-surface)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-light)" }}>
                <strong style={{ color: "#fff" }}>EU Digital Product Passport (DPP)</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "6px 0 12px" }}>Material traceability & recycled content disclosure.</p>
                <span className="brand-badge">Ready for Passport Export</span>
              </div>
              <div style={{ background: "var(--bg-surface)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-light)" }}>
                <strong style={{ color: "#fff" }}>ISO 14040/44 LCA</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "6px 0 12px" }}>Goal, scope, and pedigree DQR matrix verification.</p>
                <span className="brand-badge">Practitioner Audit Active</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Catalog */}
        {activeTab === "catalog" && (
          <div className="panel-card">
            <div className="panel-title">
              <Database size={20} style={{ color: "var(--accent-cyan)" }} /> Configured LCI Reference Datasets
            </div>
            <div className="grid3">
              <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                <strong style={{ color: "#fff" }}>USLCI</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Open US national background inventory for fuels, transport, metals, and chemicals.</p>
              </div>
              <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                <strong style={{ color: "#fff" }}>ELCD</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>European core inventory data for materials, energy grid, and end-of-life baselines.</p>
              </div>
              <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                <strong style={{ color: "#fff" }}>ecoinvent BYOL</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Client private licensed tenant deployment for high-precision international supply chain processes.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Add Item */}
        {activeTab === "manual" && (
          <div className="panel-card">
            <div className="panel-title">
              <Plus size={20} style={{ color: "var(--accent-emerald)" }} /> Add Custom BOM Component Item
            </div>
            <div className="grid3">
              <div className="form-group">
                <label>Description</label>
                <input value={manual.description} onChange={(e) => setManual({ ...manual, description: e.target.value })} placeholder="e.g. Copper coil wire drawing" />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" value={manual.quantity} onChange={(e) => setManual({ ...manual, quantity: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select value={manual.unit} onChange={(e) => setManual({ ...manual, unit: e.target.value })}>
                  <option>kg</option>
                  <option>kWh</option>
                  <option>tkm</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" onClick={addManualRow} style={{ width: "220px" }}>
              <Plus size={16} /> Add to Active Queue
            </button>
          </div>
        )}
      </section>

      {/* DQR Pedigree Modal */}
      {selectedPedigree && (
        <div className="modal-overlay open" onClick={() => setSelectedPedigree(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#fff" }}>DQR Pedigree Matrix — {selectedPedigree.raw_bom_input}</h3>
              <button className="btn-outline" style={{ height: "30px", width: "30px", padding: 0 }} onClick={() => setSelectedPedigree(null)}>✕</button>
            </div>
            <div className="grid2">
              <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "8px" }}>
                <strong style={{ color: "var(--accent-emerald)" }}>Technological Score: {selectedPedigree.dqr_technological_score}</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Material grade & process alignment.</p>
              </div>
              <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "8px" }}>
                <strong style={{ color: "var(--accent-cyan)" }}>Geographical Score: {selectedPedigree.dqr_geographical_score}</strong>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Target region context ({geo}).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certModalOpen && (
        <div className="modal-overlay open" onClick={() => setCertModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#fff" }}>Verified E-Credits & Carbon Certificate</h3>
              <button className="btn-outline" style={{ height: "30px", width: "30px", padding: 0 }} onClick={() => setCertModalOpen(false)}>✕</button>
            </div>
            <div className="certificate-card">
              <div className="cert-stamp">VERIFIED BYOL</div>
              <h2>Carbon Reduction Certificate</h2>
              <p>Issued to: <strong>{projectName}</strong></p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", opacity: 0.8 }}>AVOIDED EMISSIONS</span>
                  <div style={{ fontSize: "24px", fontWeight: 800 }}>{simResults.avoidedCo2eTons} tCO₂e</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", opacity: 0.8 }}>E-CREDIT VALUATION</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#34d399" }}>{simResults.creditDollarValue}</div>
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => window.print()}>
              🖨️ Print / Save PDF Certificate
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Drawer */}
      <div className={`assistant-drawer ${assistantOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3 style={{ color: "#fff", display: "flex", gap: "8px", alignItems: "center" }}>
            <Sparkles size={18} style={{ color: "var(--accent-emerald)" }} /> AI Review Assistant
          </h3>
          <button className="btn-outline" style={{ height: "30px", width: "30px", padding: 0 }} onClick={() => setAssistantOpen(false)}>✕</button>
        </div>

        <div className="drawer-body">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>

        <div className="drawer-footer">
          <input
            placeholder="Ask assistant about BOM mapping..."
            value={botQuestion}
            onChange={(e) => setBotQuestion(e.target.value)}
          />
          <button className="btn-indigo" onClick={submitAssistant}>
            <Bot size={16} /> Send Question
          </button>
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
