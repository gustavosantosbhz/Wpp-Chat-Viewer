import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';

export type ExportFormat = 'pdf-text' | 'pdf-image' | 'markdown' | 'html' | 'json' | 'csv';

const OPTIONS: { format: ExportFormat; label: string; hint: string }[] = [
  { format: 'pdf-text', label: 'PDF — texto selecionável', hint: 'Imprimir / salvar como PDF' },
  { format: 'pdf-image', label: 'PDF — imagem', hint: 'Fiel ao visual do chat' },
  { format: 'markdown', label: 'Markdown', hint: '.md' },
  { format: 'html', label: 'HTML', hint: 'Página autocontida' },
  { format: 'json', label: 'JSON', hint: 'Para análise e integrações' },
  { format: 'csv', label: 'CSV', hint: 'Excel / Planilhas' },
];

interface ExportMenuProps {
  disabled?: boolean;
  onExport: (format: ExportFormat) => void;
}

export function ExportMenu({ disabled, onExport }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <div className="export-menu" ref={rootRef}>
      <button
        type="button"
        className="viewer-action-btn"
        onClick={() => setIsOpen(open => !open)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Exportar conversa"
      >
        <Download size={16} />
        Exportar
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="export-menu-list" role="menu">
          {OPTIONS.map(({ format, label, hint }) => (
            <button
              key={format}
              type="button"
              role="menuitem"
              className="export-menu-item"
              onClick={() => {
                setIsOpen(false);
                onExport(format);
              }}
            >
              <span>{label}</span>
              <small>{hint}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
