import { Filter } from 'lucide-react';
import type { ContentType } from '../../types';

interface FiltersProps {
  participants: string[];
  selectedSenders: string[];
  dateStart: string;
  dateEnd: string;
  contentTypes: ContentType[];
  onSendersChange: (senders: string[]) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onContentTypesChange: (types: ContentType[]) => void;
  onClear: () => void;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  text: '💬 Texto',
  image: '📷 Imagem',
  video: '🎥 Vídeo',
  audio: '🎵 Áudio',
  file: '📎 Arquivo',
};

export function Filters({
  participants,
  selectedSenders,
  dateStart,
  dateEnd,
  contentTypes,
  onSendersChange,
  onDateRangeChange,
  onContentTypesChange,
  onClear,
}: FiltersProps) {
  const toggleSender = (sender: string) => {
    if (selectedSenders.includes(sender)) {
      onSendersChange(selectedSenders.filter(s => s !== sender));
    } else {
      onSendersChange([...selectedSenders, sender]);
    }
  };

  const toggleContentType = (type: ContentType) => {
    if (contentTypes.includes(type)) {
      onContentTypesChange(contentTypes.filter(t => t !== type));
    } else {
      onContentTypesChange([...contentTypes, type]);
    }
  };

  const toInputDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m}-${d}`;
  };

  const fromInputDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const hasActiveFilters =
    selectedSenders.length > 0 || dateStart || dateEnd || contentTypes.length > 0;

  return (
    <div className="filters-sidebar">
      <div className="filters-header">
        <h2 className="filters-sidebar-title">
          <Filter size={14} /> Filtros
        </h2>
        {hasActiveFilters && (
          <button className="filters-clear-btn" onClick={onClear}>
            Limpar
          </button>
        )}
      </div>

      {/* Remetente */}
      <div className="filters-section">
        <h4 className="filters-section-title">Remetente</h4>
        <div className="filters-chips">
          {participants.map(name => (
            <button
              key={name}
              className={`filters-chip ${selectedSenders.includes(name) ? 'filters-chip--active' : ''}`}
              onClick={() => toggleSender(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Período */}
      <div className="filters-section">
        <h4 className="filters-section-title">Período</h4>
        <div className="filters-date-range">
          <input
            type="date"
            value={toInputDate(dateStart)}
            onChange={e => onDateRangeChange(fromInputDate(e.target.value), dateEnd)}
            className="filters-date-input"
          />
          <span className="filters-date-separator">→</span>
          <input
            type="date"
            value={toInputDate(dateEnd)}
            onChange={e => onDateRangeChange(dateStart, fromInputDate(e.target.value))}
            className="filters-date-input"
          />
        </div>
      </div>

      {/* Tipo de conteúdo */}
      <div className="filters-section">
        <h4 className="filters-section-title">Tipo de conteúdo</h4>
        <div className="filters-chips">
          {(Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]).map(
            ([type, label]) => (
              <button
                key={type}
                className={`filters-chip ${contentTypes.includes(type) ? 'filters-chip--active' : ''}`}
                onClick={() => toggleContentType(type)}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
