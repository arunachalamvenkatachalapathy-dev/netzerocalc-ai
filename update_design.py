import re
import os

preview_path = r"C:\Users\user\.gemini\antigravity-ide\scratch\e-credits\preview.html"

with open(preview_path, "r", encoding="utf-8") as f:
    content = f.read()

# Update CSS root variables and fonts to match Stitch design system (Audit Precision & Sustainability)
stitch_styles = """
  /* ============================================================
  STITCH DESIGN SYSTEM: AUDIT PRECISION & SUSTAINABILITY
  ============================================================ */
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');

  :root {
    --bg-dark: #FAF9F5;
    --bg-surface: #FAF8FF;
    --bg-surface-hover: #F2F3FF;
    --bg-card: #FFFFFF;
    --border: #E2E8F0;
    --border-hover: #BFC9C1;
    --text-primary: #131B2E;
    --text-secondary: #404943;
    --text-muted: #707973;
    --emerald: #0F5238;
    --emerald-dim: #B1F0CE;
    --emerald-container: #2D6A4F;
    --cyan: #006399;
    --cyan-dim: #CDE5FF;
    --indigo: #5B00C7;
    --indigo-dim: #EADDFF;
    --red: #BA1A1A;
    --red-dim: #FFDAD6;
    --amber: #D97706;
    --amber-dim: #FEF3C7;
    --forest: #0F5238;
    --forest-soft: #A8E7C5;
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --shadow-sm: 0 1px 3px rgba(15,23,42,0.05);
    --shadow-lg: 0 10px 25px rgba(15,23,42,0.08);
    --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  html, body {
    background: var(--bg-dark) !important;
    background-color: var(--bg-dark) !important;
    color: var(--text-primary) !important;
    font-family: var(--font-sans);
    line-height: 1.5;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* TOPBAR & NAV */
  .topbar {
    position: sticky; top: 0; z-index: 50;
    height: 64px;
    background: #FFFFFF !important;
    border-bottom: 1px solid var(--border) !important;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px;
    box-shadow: var(--shadow-sm);
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-icon { font-size: 24px; color: var(--emerald); display: flex; align-items: center; }
  .brand-name { font-weight: 800; font-size: 20px; color: var(--emerald) !important; letter-spacing: -0.3px; }
  .brand-badge {
    background: var(--emerald-dim) !important;
    color: var(--emerald) !important; font-weight: 800; font-size: 11px;
    padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;
    border: 1px solid rgba(15,82,56,0.2);
  }

  /* BUTTONS */
  .btn {
    font-family: var(--font-sans); font-size: 13px; font-weight: 600;
    height: 40px; padding: 0 18px; border-radius: var(--radius-md);
    border: 1px solid var(--border-hover); background: #FFFFFF;
    color: var(--text-primary) !important;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; transition: var(--transition); text-decoration: none; white-space: nowrap;
  }
  .btn:hover { background: var(--bg-surface); border-color: var(--emerald); }
  .btn-primary { background: var(--emerald) !important; color: #FFFFFF !important; border: none !important; font-weight: 700; }
  .btn-primary:hover { background: var(--emerald-container) !important; box-shadow: 0 4px 12px rgba(15,82,56,0.25); }
  .btn-indigo { background: var(--cyan) !important; color: #FFFFFF !important; border: none !important; font-weight: 700; }
  .btn-indigo:hover { background: #004b74 !important; }
  .btn-danger { background: var(--red-dim) !important; color: var(--red) !important; border: 1px solid rgba(186,26,26,0.2) !important; }
  .btn-ghost { background: transparent; border: 1px dashed var(--border-hover); color: var(--text-secondary) !important; }
  .btn-ghost:hover { border-color: var(--cyan); color: var(--cyan) !important; }

  /* STEPPER */
  .stepper { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 32px; padding: 0 20px; }
  .step-item { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: var(--radius-md); cursor: pointer; transition: var(--transition); }
  .step-item:hover { background: var(--bg-surface); }
  .step-num {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; font-family: var(--font-mono);
    background: var(--bg-surface); border: 2px solid var(--border-hover); color: var(--text-muted);
  }
  .step-label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
  .step-connector { width: 40px; height: 2px; background: var(--border); flex-shrink: 0; }
  .step-item.active .step-num { background: var(--emerald); border-color: var(--emerald); color: #FFFFFF; }
  .step-item.active .step-label { color: var(--emerald); font-weight: 700; }
  .step-item.done .step-num { background: var(--emerald-dim); border-color: var(--emerald); color: var(--emerald); }
  .step-item.done .step-label { color: var(--text-primary); }

  /* CARDS & HERO */
  .app-container { max-width: 1240px; margin: 0 auto; padding: 32px 24px 80px; background: var(--bg-dark) !important; }
  .card {
    background: #FFFFFF !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-lg) !important;
    padding: 32px !important;
    margin-bottom: 24px !important;
    box-shadow: var(--shadow-sm) !important;
  }
  .card-title { font-size: 20px; font-weight: 800; color: var(--text-primary) !important; margin-bottom: 6px; letter-spacing: -0.2px; }
  .card-subtitle { font-size: 14px; color: var(--text-secondary) !important; margin-bottom: 24px; }

  .hero-section { text-align: center; margin-bottom: 32px; background: transparent !important; }
  .hero-title { font-size: 32px; font-weight: 800; color: var(--text-primary) !important; margin-bottom: 10px; letter-spacing: -0.3px; }
  .hero-title span { color: var(--emerald) !important; }
  .hero-desc { font-size: 15px; color: var(--text-secondary) !important; max-width: 680px; margin: 0 auto 24px; line-height: 1.6; }

  /* HOW IT WORKS CARDS */
  .how-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .how-step {
    background: #FFFFFF !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-lg) !important;
    padding: 20px 16px !important;
    text-align: center;
    box-shadow: var(--shadow-sm) !important;
  }
  .how-step-icon { font-size: 28px; margin-bottom: 8px; color: var(--emerald); }
  .how-step-title { font-size: 14px; font-weight: 700; color: var(--text-primary) !important; margin-bottom: 4px; }
  .how-step-desc { font-size: 12px; color: var(--text-muted) !important; line-height: 1.4; }

  /* FORMS & INPUTS */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-label { font-size: 11px; font-weight: 800; color: var(--text-secondary) !important; text-transform: uppercase; letter-spacing: 0.5px; }
  .form-input, .form-select {
    width: 100%; font-family: var(--font-sans); font-size: 14px;
    background: #FFFFFF !important; border: 1px solid var(--border-hover) !important;
    border-radius: var(--radius-md); padding: 10px 14px;
    color: var(--text-primary) !important; outline: none; transition: var(--transition);
  }
  .form-input:focus, .form-select:focus { border-color: var(--emerald) !important; box-shadow: 0 0 0 3px rgba(15,82,56,0.12) !important; }

  /* TABLES */
  .table-container { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-lg); background: #FFFFFF; }
  .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
  .data-table th { background: #F8FAFC !important; color: var(--text-secondary) !important; font-weight: 800; padding: 12px 16px; border-bottom: 2px solid var(--border); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); color: var(--text-primary) !important; }
  .data-table tr:hover { background: #F8FAFC !important; }

  /* DQR PEDIGREE PILLS */
  .dqr-group { display: flex; gap: 4px; align-items: center; }
  .dqr-pill {
    width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; font-family: var(--font-mono);
  }
  .dqr-1 { background: #B1F0CE; color: #002114; }
  .dqr-2 { background: #CDE5FF; color: #001D32; }
  .dqr-3 { background: #FEF3C7; color: #92400E; }
  .dqr-4, .dqr-5 { background: #FFDAD6; color: #93000A; }

  /* MONO NUMBERS */
  .font-mono-data { font-family: var(--font-mono) !important; font-weight: 600; }
"""

# Replace old CSS block with new Stitch design styles
pattern = re.compile(r"<style>.*?</style>", re.DOTALL)
content = pattern.sub(f"<style>{stitch_styles}</style>", content, count=1)

with open(preview_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated preview.html with Stitch Design System!")
