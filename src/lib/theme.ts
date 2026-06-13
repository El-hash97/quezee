export const THEME_COLORS = [
  { label: 'Black',       value: '#000000' },
  { label: 'Off-White',   value: '#FFFDF5' },
  { label: 'Bold Yellow', value: '#FFD23F' },
  { label: 'Coral Pink',  value: '#FF6B6B' },
  { label: 'Sky Blue',    value: '#74B9FF' },
  { label: 'Soft Green',  value: '#88D498' },
  { label: 'Orange',      value: '#FFA552' },
  { label: 'Lavender',    value: '#B8A9FA' },
];

export const THEME_KEY = 'qcc_theme_bg';

function setVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

export function applyTheme(bg: string) {
  if (bg === '#000000') {
    setVar('--bg-base', '#000000');
    setVar('--bg-surface', '#08080f');
    setVar('--bg-elevated', '#14131a');
    setVar('--bg-card', '#14131a');
    setVar('--bg-card-hover', '#1c1b24');
    setVar('--border-dim', '#2a2830');
    setVar('--border', '#3d3b4a');
    setVar('--border-bright', '#ececed');
    setVar('--text-primary', '#ececed');
    setVar('--text-secondary', '#a6a6b0');
    setVar('--text-muted', '#5a5a70');
    setVar('--shadow-card', '3px 3px 0px 0px rgb(243,243,246)');
    setVar('--shadow-glow', '5px 5px 0px 0px rgb(243,243,246)');
    setVar('--shadow-glow-sm', '3px 3px 0px 0px rgb(243,243,246)');
    setVar('--shadow-heavy', '6px 6px 0px 0px rgb(243,243,246)');
  } else {
    setVar('--bg-base', bg);
    setVar('--bg-surface', '#f5f3ec');
    setVar('--bg-elevated', '#ede9df');
    setVar('--bg-card', '#ffffff');
    setVar('--bg-card-hover', '#faf8f2');
    setVar('--border-dim', 'rgba(0,0,0,0.08)');
    setVar('--border', 'rgba(0,0,0,0.18)');
    setVar('--border-bright', '#000000');
    setVar('--text-primary', '#111111');
    setVar('--text-secondary', '#444444');
    setVar('--text-muted', '#6b7280');
    setVar('--shadow-card', '3px 3px 0px 0px #000000');
    setVar('--shadow-glow', '5px 5px 0px 0px #000000');
    setVar('--shadow-glow-sm', '3px 3px 0px 0px #000000');
    setVar('--shadow-heavy', '6px 6px 0px 0px #000000');
  }
}
