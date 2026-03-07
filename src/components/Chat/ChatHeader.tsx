import {
  Moon,
  Sun,
  FileDown,
  FileText,
  RotateCcw,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  BarChart2,
} from 'lucide-react';

interface ChatHeaderProps {
  participants: string[];
  dateStart: string;
  dateEnd: string;
  totalMessages: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onExportPdf: () => void;
  onExportMarkdown: () => void;
  onReset: () => void;
  onToggleSearch: () => void;
  onToggleStats: () => void;
  isSearchOpen: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchResultsCount: number;
  currentResultIndex: number;
  onNextResult: () => void;
  onPrevResult: () => void;
  isPdfExporting: boolean;
}

export function ChatHeader({
  participants,
  dateStart,
  dateEnd,
  totalMessages,
  theme,
  onToggleTheme,
  onExportPdf,
  onExportMarkdown,
  onReset,
  onToggleSearch,
  onToggleStats,
  isSearchOpen,
  searchTerm,
  onSearchChange,
  searchResultsCount,
  currentResultIndex,
  onNextResult,
  onPrevResult,
  isPdfExporting,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header-main">
        {/* Info da conversa */}
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor" className="chat-header-wpp-icon">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <h1 className="chat-header-names">{participants.join(', ')}</h1>
            <p className="chat-header-meta">
              {dateStart} → {dateEnd} · {totalMessages.toLocaleString('pt-BR')} mensagens
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="chat-header-actions">
          <button
            className="chat-header-btn"
            onClick={onToggleStats}
            title="Estatísticas"
          >
            <BarChart2 size={18} />
          </button>
          <button
            className="chat-header-btn"
            onClick={onToggleSearch}
            title="Pesquisar"
          >
            <Search size={18} />
          </button>
          <button
            className="chat-header-btn"
            onClick={onExportPdf}
            disabled={isPdfExporting}
            title="Exportar PDF"
          >
            <FileDown size={18} />
          </button>
          <button
            className="chat-header-btn"
            onClick={onExportMarkdown}
            title="Exportar Markdown"
          >
            <FileText size={18} />
          </button>
          <button
            className="chat-header-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="chat-header-btn chat-header-btn--accent"
            onClick={onReset}
            title="Nova conversa"
          >
            <RotateCcw size={18} />
            <span className="chat-header-btn-label">Nova</span>
          </button>
        </div>
      </div>

      {/* Barra de busca */}
      {isSearchOpen && (
        <div className="chat-header-search">
          <div className="search-input-wrapper">
            <Search size={16} className="search-input-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Pesquisar na conversa..."
              className="search-input"
              autoFocus
            />
            {searchTerm && (
              <span className="search-counter">
                {searchResultsCount > 0
                  ? `${currentResultIndex + 1} de ${searchResultsCount}`
                  : 'Nenhum resultado'}
              </span>
            )}
          </div>
          <div className="search-nav">
            <button
              className="search-nav-btn"
              onClick={onPrevResult}
              disabled={searchResultsCount === 0}
            >
              <ChevronUp size={18} />
            </button>
            <button
              className="search-nav-btn"
              onClick={onNextResult}
              disabled={searchResultsCount === 0}
            >
              <ChevronDown size={18} />
            </button>
            <button className="search-nav-btn" onClick={onToggleSearch}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
