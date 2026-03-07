import { useState, useCallback, useRef } from 'react';
import { Upload, FileArchive, FileText } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
  progress: {
    phase: string;
    current: number;
    total: number;
    message: string;
  };
}

export function DropZone({ onFilesSelected, isLoading, progress }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter(
        f => f.name.endsWith('.txt') || f.name.endsWith('.zip')
      );
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      f => f.name.endsWith('.txt') || f.name.endsWith('.zip')
    );
    if (files.length > 0) onFilesSelected(files);
  };

  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="upload-screen">
      {/* Logo WhatsApp estilizado */}
      <div className="upload-logo">
        <svg viewBox="0 0 24 24" fill="currentColor" className="upload-whatsapp-icon">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>

      <h1 className="upload-title">WhatsApp Chat Viewer</h1>
      <p className="upload-subtitle">Visualize e exporte suas conversas com estilo</p>

      {isLoading ? (
        <div className="upload-progress-area">
          <div className="upload-progress-bar-container">
            <div
              className="upload-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="upload-progress-text">{progress.message}</p>
          <p className="upload-progress-percent">{progressPercent}%</p>
        </div>
      ) : (
        <div
          className={`upload-dropzone ${isDragOver ? 'upload-dropzone--active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.zip"
            multiple
            onChange={handleInputChange}
            className="upload-input"
          />

          <Upload className="upload-icon" size={48} />

          <p className="upload-dropzone-text">
            Arraste seus arquivos <code>.txt</code> ou <code>.zip</code> exportados do WhatsApp
          </p>
          <p className="upload-dropzone-subtext">ou clique para selecionar</p>

          <div className="upload-file-types">
            <span className="upload-file-badge">
              <FileText size={14} /> .txt
            </span>
            <span className="upload-file-badge">
              <FileArchive size={14} /> .zip
            </span>
          </div>
        </div>
      )}

      <p className="upload-privacy">
        🔒 Todos os arquivos são processados localmente no seu navegador. Nenhum dado é enviado a
        servidores externos.
      </p>
    </div>
  );
}
