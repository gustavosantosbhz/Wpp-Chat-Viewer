import { Filter } from 'lucide-react';
import type { ContentType } from '../../types';

interface FiltersProps {
  participants: string[];
  selectedSenders: string[];
  dateStart: string;
  dateEnd: string;
  contentTypes: ContentType[];
  weekdays: number[];
  hours: number[];
  onSendersChange: (senders: string[]) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onContentTypesChange: (types: ContentType[]) => void;
  onWeekdaysChange: (weekdays: number[]) => void;
  onHoursChange: (hours: number[]) => void;
  onClear: () => void;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  text: '💬 Texto',
  image: '📷 Imagem',
  video: '🎥 Vídeo',
  audio: '🎵 Áudio',
  file: '📎 Arquivo',
};

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter(item => item !== value) : [...list, value];

export function Filters({
  participants,
  selectedSenders,
  dateStart,
  dateEnd,
  contentTypes,
  weekdays,
  hours,
  onSendersChange,
  onDateRangeChange,
  onContentTypesChange,
  onWeekdaysChange,
  onHoursChange,
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
    selectedSenders.length > 0 || dateStart || dateEnd || contentTypes.length > 0 || weekdays.length > 0 || hours.length > 0;

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

      {/* Dia da semana */}
      <div className="filters-section">
        <h4 className="filters-section-title">Dia da semana</h4>
        <div className="filters-chips">
          {WEEKDAY_LABELS.map((label, day) => (
            <button
              key={day}
              className={`filters-chip ${weekdays.includes(day) ? 'filters-chip--active' : ''}`}
              aria-pressed={weekdays.includes(day)}
              onClick={() => onWeekdaysChange(toggle(weekdays, day))}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Horário */}
      <div className="filters-section">
        <h4 className="filters-section-title">Horário</h4>
        <div className="filters-hours">
          {HOURS.map(hour => (
            <button
              key={hour}
              className={`filters-chip filters-chip--compact ${hours.includes(hour) ? 'filters-chip--active' : ''}`}
              aria-pressed={hours.includes(hour)}
              aria-label={`${hour} horas`}
              onClick={() => onHoursChange(toggle(hours, hour))}
            >
              {hour}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
