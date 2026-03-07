import { useMemo } from 'react';
import { Users, Calendar, TrendingUp, BarChart2, MessageCircle } from 'lucide-react';
import type { ParsedMessage } from '../../types';
import { calculateStats } from '../../utils/stats';

interface StatsPanelProps {
  messages: ParsedMessage[];
}

export function StatsPanel({ messages }: StatsPanelProps) {
  const stats = useMemo(() => calculateStats(messages), [messages]);

  const sortedParticipants = Object.entries(stats.messagesByParticipant).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="stats-sidebar">
      <h2 className="stats-sidebar-title">
        <BarChart2 size={16} />
        Estatísticas
      </h2>

      <div className="stats-sidebar-grid">
        {/* Total */}
        <div className="stats-card">
          <div className="stats-card-icon">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="stats-card-value">{stats.totalMessages.toLocaleString('pt-BR')}</p>
            <p className="stats-card-label">mensagens</p>
          </div>
        </div>

        {/* Período */}
        <div className="stats-card">
          <div className="stats-card-icon">
            <Calendar size={18} />
          </div>
          <div>
            <p className="stats-card-value">{stats.period.start}</p>
            <p className="stats-card-label">→ {stats.period.end}</p>
          </div>
        </div>

        {/* Média/dia */}
        <div className="stats-card">
          <div className="stats-card-icon">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="stats-card-value">{stats.avgMessagesPerDay}</p>
            <p className="stats-card-label">msgs/dia</p>
          </div>
        </div>

        {/* Mês mais ativo */}
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

      {/* Barras por participante */}
      <div className="stats-participants">
        <h3 className="stats-participants-title">
          <Users size={14} /> Por participante
        </h3>
        {sortedParticipants.map(([name, count]) => {
          const percent = Math.round((count / stats.totalMessages) * 100);
          return (
            <div key={name} className="stats-participant">
              <div className="stats-participant-info">
                <span className="stats-participant-name">{name}</span>
                <span className="stats-participant-count">
                  {count.toLocaleString('pt-BR')} ({percent}%)
                </span>
              </div>
              <div className="stats-participant-bar-bg">
                <div
                  className="stats-participant-bar"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
