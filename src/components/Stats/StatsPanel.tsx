import { useMemo } from 'react';
import { Users, Calendar, TrendingUp, BarChart2, MessageCircle } from 'lucide-react';
import type { FilterState, ParsedMessage } from '../../types';
import { calculateStats, monthRange } from '../../utils/stats';
import { BarChart } from './BarChart';

interface StatsPanelProps {
  messages: ParsedMessage[];
  filters: FilterState;
  onToggleSender: (name: string) => void;
  onToggleHour: (hour: number) => void;
  onToggleWeekday: (weekday: number) => void;
  onSelectMonth: (month: string) => void;
  onSearchWord: (word: string) => void;
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MAX_MONTH_BARS = 24;

const n = (value: number) => value.toLocaleString('pt-BR');
const plural = (count: number) => `${n(count)} ${count === 1 ? 'mensagem' : 'mensagens'}`;

export function StatsPanel({
  messages,
  filters,
  onToggleSender,
  onToggleHour,
  onToggleWeekday,
  onSelectMonth,
  onSearchWord,
}: StatsPanelProps) {
  const stats = useMemo(() => calculateStats(messages), [messages]);

  const sortedParticipants = Object.entries(stats.messagesByParticipant).sort(
    ([, a], [, b]) => b - a
  );

  const visibleMonths = stats.byMonth.slice(-MAX_MONTH_BARS);
  const [selectedStart, selectedEnd] = [filters.dateStart, filters.dateEnd];

  return (
    <div className="stats-sidebar">
      <h2 className="stats-sidebar-title">
        <BarChart2 size={16} />
        Estatísticas
      </h2>

      <div className="stats-sidebar-grid">
        <div className="stats-card">
          <div className="stats-card-icon">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="stats-card-value">{n(stats.totalMessages)}</p>
            <p className="stats-card-label">mensagens</p>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon">
            <Calendar size={18} />
          </div>
          <div>
            <p className="stats-card-value">{stats.period.start}</p>
            <p className="stats-card-label">→ {stats.period.end}</p>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="stats-card-value">{stats.avgMessagesPerDay}</p>
            <p className="stats-card-label">msgs/dia</p>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon">
            <BarChart2 size={18} />
          </div>
          <div>
            <p className="stats-card-value">{stats.mostActiveMonth}</p>
            <p className="stats-card-label">mês mais ativo</p>
          </div>
        </div>
      </div>

      {/* Barras por participante (clique para filtrar) */}
      <div className="stats-participants">
        <h3 className="stats-participants-title">
          <Users size={14} /> Por participante
        </h3>
        {sortedParticipants.map(([name, count]) => {
          const percent = Math.round((count / stats.totalMessages) * 100);
          const active = filters.senders.includes(name);
          return (
            <button
              key={name}
              type="button"
              className={`stats-participant ${active ? 'stats-participant--active' : ''}`}
              aria-pressed={active}
              title={`Filtrar mensagens de ${name}`}
              onClick={() => onToggleSender(name)}
            >
              <span className="stats-participant-info">
                <span className="stats-participant-name">{name}</span>
                <span className="stats-participant-count">
                  {n(count)} ({percent}%)
                </span>
              </span>
              <span className="stats-participant-bar-bg">
                <span className="stats-participant-bar" style={{ width: `${percent}%` }} />
              </span>
            </button>
          );
        })}
      </div>

      <BarChart
        title="Por horário"
        labelEvery={6}
        bars={stats.byHour.map((value, hour) => ({
          key: hour,
          label: `${hour}h`,
          value,
          tooltip: `${hour}h–${hour}h59: ${plural(value)}`,
          active: filters.hours.includes(hour),
        }))}
        onSelect={key => onToggleHour(Number(key))}
      />

      <BarChart
        title="Por dia da semana"
        bars={stats.byWeekday.map((value, day) => ({
          key: day,
          label: WEEKDAYS[day][0],
          value,
          tooltip: `${WEEKDAYS[day]}: ${plural(value)}`,
          active: filters.weekdays.includes(day),
        }))}
        onSelect={key => onToggleWeekday(Number(key))}
      />

      {visibleMonths.length > 1 && (
        <BarChart
          title={stats.byMonth.length > MAX_MONTH_BARS ? `Por mês (últimos ${MAX_MONTH_BARS})` : 'Por mês'}
          labelEvery={Math.ceil(visibleMonths.length / 4)}
          bars={visibleMonths.map(({ key, count }) => {
            const [start, end] = monthRange(key);
            return {
              key,
              label: key,
              value: count,
              tooltip: `${key}: ${plural(count)}`,
              active: selectedStart === start && selectedEnd === end,
            };
          })}
          onSelect={key => onSelectMonth(String(key))}
        />
      )}

      {stats.topWords.length > 0 && (
        <div className="stats-chart">
          <h3 className="stats-participants-title">Palavras mais usadas</h3>
          <ol className="stats-words">
            {stats.topWords.map(({ word, count }) => (
              <li key={word}>
                <button
                  type="button"
                  className="stats-word"
                  title={`Pesquisar "${word}"`}
                  onClick={() => onSearchWord(word)}
                >
                  <span className="stats-word-text">{word}</span>
                  <span className="stats-participant-count">{n(count)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
