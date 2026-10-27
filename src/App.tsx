import { useState } from 'react';
import { DropZone } from './components/Upload/DropZone';
import { ChatView } from './components/Chat/ChatView';
import { StatsPanel } from './components/Stats/StatsPanel';
import { Filters } from './components/Search/Filters';
import { PdfProgressModal } from './components/UI/PdfProgressModal';
import { ExportMenu, type ExportFormat } from './components/UI/ExportMenu';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { monthRange } from './utils/stats';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';
import { useSearch } from './hooks/useSearch';
import type { PdfExportProgress } from './utils/pdfExport';
import type { ChatData } from './types';
import {
  RefreshCw, Search, ChevronUp, ChevronDown, X,
  Moon, Sun,
  ArrowLeft, Video, Phone, MoreVertical,
} from 'lucide-react';

function App() {
  const { chatData, isLoading, progress, processFiles, resetChat } = useChat();
  const { theme, toggleTheme } = useTheme();
  const [selectedSender, setSelectedSender] = useState<string>('');

  const {
    filters,
    filteredMessages,
    searchResults,
    currentResultIndex,
    setSearchTerm,
    setSenders,
    setDateRange,
    setContentTypes,
    setHours,
    setWeekdays,
    clearFilters,
    goToNextResult,
    goToPrevResult,
  } = useSearch(chatData?.messages || []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<PdfExportProgress>({
    currentPage: 0,
    totalPages: 0,
  });

  const activeSender = selectedSender || chatData?.firstSender || '';

  // Determina se há filtros ativos
  const hasActiveFilters =
    filters.senders.length > 0 || filters.dateStart || filters.dateEnd || filters.contentTypes.length > 0 ||
    filters.hours.length > 0 || filters.weekdays.length > 0 || filters.searchTerm;

  // Mensagens para exportação: filtradas se filtro ativo, todas se não
  const exportMessages = hasActiveFilters ? filteredMessages : chatData?.messages || [];

  const handleExportPdf = async (data: ChatData) => {
    setIsPdfExporting(true);
    try {
      // jsPDF e html2canvas só são baixados quando o usuário exporta
      const { exportToPdf } = await import('./utils/pdfExport');
      await exportToPdf(data, progress => {
        setPdfProgress(progress);
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Não foi possível gerar o PDF. Tente exportar um período menor.');
    } finally {
      setIsPdfExporting(false);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!chatData) return;
    const data: ChatData = { ...chatData, messages: exportMessages, totalMessages: exportMessages.filter(m => !m.isSystemMessage).length };

    if (format === 'pdf-image') return handleExportPdf(data);

    // Cada formato é carregado só quando usado
    if (format === 'markdown') {
      (await import('./utils/mdExport')).downloadMarkdown(data);
      return;
    }
    const exporters = await import('./utils/exporters');
    if (format === 'pdf-text') exporters.printChat(data);
    else if (format === 'html') exporters.downloadHtml(data);
    else if (format === 'json') exporters.downloadJson(data);
    else exporters.downloadCsv(data);
  };

  const toggleItem = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter(item => item !== value) : [...list, value];

  // Clicar no mês de novo limpa o período
  const handleSelectMonth = (month: string) => {
    const [start, end] = monthRange(month);
    if (filters.dateStart === start && filters.dateEnd === end) setDateRange('', '');
    else setDateRange(start, end);
  };

  const handleSearchWord = (word: string) => {
    setIsSearchOpen(true);
    setSearchTerm(word);
  };

  const handleToggleSearch = () => {
    setIsSearchOpen(prev => !prev);
    if (isSearchOpen) {
      setSearchTerm('');
    }
  };

  const handleReset = () => {
    setSelectedSender('');
    resetChat();
  };

  // Tela de upload
  if (!chatData) {
    return (
      <div className={`app ${theme}`}>
        <DropZone
          onFilesSelected={files => void processFiles(files)}
          isLoading={isLoading}
          progress={progress}
        />
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <div className="viewer-layout">
        {/* ===== TOOLBAR SUPERIOR (fora do phone) ===== */}
        <div className="viewer-toolbar">
          <button className="viewer-toolbar-btn" onClick={handleReset} title="Nova conversa">
            <RefreshCw size={14} />
            Nova conversa
          </button>

          <span className="viewer-toolbar-count">
            {chatData.totalMessages.toLocaleString('pt-BR')} mensagens
          </span>

          <span className="viewer-toolbar-sep">·</span>
          <span className="viewer-toolbar-date">
            {chatData.dateStart} → {chatData.dateEnd}
          </span>
        </div>

        {/* ===== SELETOR DE PARTICIPANTE (fora do phone) ===== */}
        <div className="viewer-participant-selector">
          <span className="viewer-selector-label">Quem é você na conversa?</span>
          <div className="viewer-selector-options">
            {chatData.participants.map(name => (
              <button
                key={name}
                className={`viewer-selector-btn ${activeSender === name ? 'viewer-selector-btn--active' : ''}`}
                onClick={() => setSelectedSender(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* ===== BARRA DE AÇÕES (fora do phone) ===== */}
        <div className="viewer-actions-bar">
          <button className="viewer-action-btn" onClick={handleToggleSearch} title="Pesquisar">
            <Search size={16} />
            Pesquisar
          </button>


          <span className="viewer-actions-sep" />
          <ExportMenu disabled={isPdfExporting} onExport={format => void handleExport(format)} />
          <span className="viewer-actions-sep" />
          <button className="viewer-action-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'} aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* ===== BUSCA EXPANDIDA (fora do phone) ===== */}
        {isSearchOpen && (
          <div className="viewer-search-bar">
            <div className="viewer-search-input-wrapper">
              <Search size={16} className="viewer-search-icon" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Pesquisar na conversa..."
                aria-label="Pesquisar na conversa"
                className="viewer-search-input"
                autoFocus
              />
              {filters.searchTerm && (
                <span className="viewer-search-counter">
                  {searchResults.length > 0
                    ? `${currentResultIndex + 1} de ${searchResults.length}`
                    : 'Nenhum resultado'}
                </span>
              )}
            </div>
            <div className="viewer-search-nav">
              <button className="viewer-search-nav-btn" onClick={goToPrevResult} disabled={searchResults.length === 0} aria-label="Resultado anterior">
                <ChevronUp size={18} />
              </button>
              <button className="viewer-search-nav-btn" onClick={goToNextResult} disabled={searchResults.length === 0} aria-label="Próximo resultado">
                <ChevronDown size={18} />
              </button>
              <button className="viewer-search-nav-btn" onClick={handleToggleSearch} aria-label="Fechar busca">
                <X size={18} />
              </button>
            </div>
          </div>
        )}



        {/* ===== CONTAINER: FILTROS + PHONE ===== */}
        <div className="viewer-content">
          {/* Sidebar de filtros (sempre visível) */}
          <Filters
            participants={chatData.participants}
            selectedSenders={filters.senders}
            dateStart={filters.dateStart}
            dateEnd={filters.dateEnd}
            contentTypes={filters.contentTypes}
            onSendersChange={setSenders}
            onDateRangeChange={setDateRange}
            onContentTypesChange={setContentTypes}
            weekdays={filters.weekdays}
            hours={filters.hours}
            onWeekdaysChange={setWeekdays}
            onHoursChange={setHours}
            onClear={clearFilters}
          />

          {/* ===== FRAME DO SMARTPHONE ===== */}
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-screen">
              {/* Header WhatsApp simples (dentro do phone) */}
              <div className="phone-wpp-header">
                <button className="phone-wpp-header-back" aria-label="Voltar">
                  <ArrowLeft size={20} />
                </button>
                <div className="phone-wpp-avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="phone-wpp-avatar-icon">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div className="phone-wpp-header-info">
                  <span className="phone-wpp-header-name">
                    {chatData.participants.join(', ')}
                  </span>
                </div>
                <div className="phone-wpp-header-icons">
                  <Video size={18} />
                  <Phone size={18} />
                  <MoreVertical size={18} />
                </div>
              </div>

              {/* Chat */}
              <div className="chat-main">
                <ErrorBoundary>
                  <ChatView
                    messages={filteredMessages}
                    participants={chatData.participants}
                    firstSender={activeSender}
                    mediaFiles={chatData.mediaFiles}
                    searchTerm={filters.searchTerm}
                    searchResults={searchResults}
                    currentResultIndex={currentResultIndex}
                  />
                </ErrorBoundary>
              </div>
            </div>

            {/* Barra inferior fake do WhatsApp */}
            <div className="phone-bottom-bar">
              <div className="phone-bottom-bar-input">
                <span className="phone-bottom-emoji">😊</span>
                <span className="phone-bottom-text">Mensagem</span>
              </div>
              <div className="phone-bottom-actions">
                <span className="phone-bottom-icon">📎</span>
                <span className="phone-bottom-icon">📷</span>
              </div>
              <div className="phone-bottom-mic">🎤</div>
            </div>
          </div>

          {/* ===== ESTATÍSTICAS à direita do phone ===== */}
          <StatsPanel
            messages={chatData.messages}
            filters={filters}
            onToggleSender={name => setSenders(toggleItem(filters.senders, name))}
            onToggleHour={hour => setHours(toggleItem(filters.hours, hour))}
            onToggleWeekday={day => setWeekdays(toggleItem(filters.weekdays, day))}
            onSelectMonth={handleSelectMonth}
            onSearchWord={handleSearchWord}
          />
        </div>
      </div>

      <PdfProgressModal
        isOpen={isPdfExporting}
        currentPage={pdfProgress.currentPage}
        totalPages={pdfProgress.totalPages}
      />
    </div>
  );
}

export default App;
