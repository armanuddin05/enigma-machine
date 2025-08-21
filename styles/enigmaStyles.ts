// styles/enigmaStyles.ts
import { CSSProperties } from 'react';

interface EnigmaStyles {
  container: CSSProperties;
  maxWidth: CSSProperties;
  header: CSSProperties;
  title: CSSProperties;
  subtitle: CSSProperties;
  grid: CSSProperties;
  panel: CSSProperties;
  whitePanel: CSSProperties;
  sectionTitle: CSSProperties;
  rotorGrid: CSSProperties;
  rotorItem: CSSProperties;
  label: CSSProperties;
  select: CSSProperties;
  whiteSelect: CSSProperties;
  slider: CSSProperties;
  positionDisplay: CSSProperties;
  plugInput: CSSProperties;
  plugRow: CSSProperties;
  addButton: CSSProperties;
  plugChips: CSSProperties;
  plugChip: CSSProperties;
  removeButton: CSSProperties;
  modeButtons: CSSProperties;
  textarea: CSSProperties;
  readOnlyTextarea: CSSProperties;
  buttonRow: CSSProperties;
  copyButton: CSSProperties;
  statusPanel: CSSProperties;
  statusGrid: CSSProperties;
  statusItem: CSSProperties;
  statusLabel: CSSProperties;
  statusValue: CSSProperties;
  statusSmall: CSSProperties;
  statusFooter: CSSProperties;
  footer: CSSProperties;
  modeButton: (active: boolean) => CSSProperties;
  processButton: (disabled: boolean) => CSSProperties;
  resetButton: CSSProperties;
}

export const enigmaStyles: EnigmaStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)',
    padding: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  maxWidth: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#92400e'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '24px'
  },
  panel: {
    backgroundColor: '#78350f',
    borderRadius: '12px',
    padding: '24px',
    color: 'white',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  whitePanel: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  rotorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '16px'
  },
  rotorItem: {
    textAlign: 'center'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '4px'
  },
  select: {
    width: '100%',
    backgroundColor: '#92400e',
    border: '1px solid #a16207',
    borderRadius: '4px',
    padding: '8px',
    textAlign: 'center',
    color: 'white',
    fontSize: '14px'
  },
  whiteSelect: {
    width: '100%',
    backgroundColor: '#92400e',
    border: '1px solid #a16207',
    borderRadius: '4px',
    padding: '12px',
    color: 'white'
  },
  slider: {
    width: '100%',
    marginBottom: '8px'
  },
  positionDisplay: {
    textAlign: 'center',
    marginTop: '4px',
    fontFamily: 'monospace',
    fontSize: '1.125rem',
    fontWeight: 'bold'
  },
  plugInput: {
    flex: 1,
    backgroundColor: '#92400e',
    border: '1px solid #a16207',
    borderRadius: '4px',
    padding: '12px',
    textAlign: 'center',
    fontFamily: 'monospace',
    color: 'white'
  },
  plugRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px'
  },
  addButton: {
    backgroundColor: '#a16207',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '4px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  plugChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  plugChip: {
    backgroundColor: '#a16207',
    borderRadius: '4px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem'
  },
  removeButton: {
    color: '#fbbf24',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px'
  },
  modeButtons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px'
  },
  modeButton: (active: boolean) => ({
    flex: 1,
    padding: '12px 16px',
    borderRadius: '4px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: active ? '#16a34a' : '#e5e7eb',
    color: active ? 'white' : '#374151'
  }),
  textarea: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    padding: '12px',
    height: '96px',
    fontFamily: 'monospace',
    resize: 'none',
    fontSize: '14px'
  },
  readOnlyTextarea: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    padding: '12px',
    height: '96px',
    fontFamily: 'monospace',
    resize: 'none',
    backgroundColor: '#f9fafb',
    fontSize: '14px'
  },
  processButton: (disabled: boolean) => ({
    flex: 1,
    padding: '12px 24px',
    borderRadius: '4px',
    border: 'none',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    backgroundColor: disabled ? '#d1d5db' : '#16a34a',
    color: disabled ? '#6b7280' : 'white'
  }),
  resetButton: {
    padding: '12px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  buttonRow: {
    display: 'flex',
    gap: '16px'
  },
  copyButton: {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: '#d97706',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '12px'
  },
  statusPanel: {
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    padding: '16px',
    color: 'white',
    fontFamily: 'monospace'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    textAlign: 'center'
  },
  statusItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    marginBottom: '4px'
  },
  statusValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '2px'
  },
  statusSmall: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  statusFooter: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #374151'
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
    color: '#92400e',
    fontSize: '0.875rem'
  }
};