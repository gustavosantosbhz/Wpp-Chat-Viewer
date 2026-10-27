import { useState, useMemo, useCallback } from 'react';
import type { ParsedMessage, FilterState, ContentType } from '../types';
import { parseDateToTimestamp } from '../utils/parser';
import { foldCached, foldText } from '../utils/text';

const DAY_MS = 24 * 60 * 60 * 1000;

const initialFilter: FilterState = {
  searchTerm: '',
  senders: [],
  dateStart: '',
  dateEnd: '',
  contentTypes: [],
  hours: [],
  weekdays: [],
};

export function useSearch(messages: ParsedMessage[]) {
  const [filters, setFilters] = useState<FilterState>(initialFilter);
  const [rawResultIndex, setCurrentResultIndex] = useState(0);

  const filteredMessages = useMemo(() => {
    let result = messages;

    // Filtro por remetente
    if (filters.senders.length > 0) {
      result = result.filter(m => filters.senders.includes(m.sender));
    }

    // Filtro por período (início do dia inicial até o fim do dia final)
    if (filters.dateStart) {
      const start = parseDateToTimestamp(filters.dateStart);
      result = result.filter(m => m.timestamp >= start);
    }

    if (filters.dateEnd) {
      const end = parseDateToTimestamp(filters.dateEnd) + DAY_MS;
      result = result.filter(m => m.timestamp < end);
    }

    // Filtro por horário e dia da semana
    if (filters.hours.length > 0) {
      result = result.filter(m => filters.hours.includes(new Date(m.timestamp).getHours()));
    }

    if (filters.weekdays.length > 0) {
      result = result.filter(m => filters.weekdays.includes(new Date(m.timestamp).getDay()));
    }

    // Filtro por tipo de conteúdo
    if (filters.contentTypes.length > 0) {
      result = result.filter(m => {
        if (filters.contentTypes.includes('text' as ContentType) && !m.mediaType) return true;
        if (m.mediaType && filters.contentTypes.includes(m.mediaType as ContentType)) return true;
        return false;
      });
    }

    return result;
  }, [messages, filters.senders, filters.dateStart, filters.dateEnd, filters.contentTypes, filters.hours, filters.weekdays]);

  // Resultados da busca (índices das mensagens que contêm o termo, sem diferenciar acentos)
  const searchResults = useMemo(() => {
    const term = foldText(filters.searchTerm.trim());
    if (!term) return [];
    const indices: number[] = [];
    filteredMessages.forEach((msg, index) => {
      if (foldCached(msg, msg.text).includes(term)) indices.push(index);
    });
    return indices;
  }, [filteredMessages, filters.searchTerm]);

  // Os filtros podem reduzir os resultados: mantém o índice dentro do intervalo
  const currentResultIndex = Math.min(rawResultIndex, Math.max(searchResults.length - 1, 0));

  const setSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
    setCurrentResultIndex(0);
  }, []);

  const setSenders = useCallback((senders: string[]) => {
    setFilters(prev => ({ ...prev, senders }));
  }, []);

  const setDateRange = useCallback((dateStart: string, dateEnd: string) => {
    setFilters(prev => ({ ...prev, dateStart, dateEnd }));
  }, []);

  const setContentTypes = useCallback((contentTypes: ContentType[]) => {
    setFilters(prev => ({ ...prev, contentTypes }));
  }, []);

  const setHours = useCallback((hours: number[]) => {
    setFilters(prev => ({ ...prev, hours }));
  }, []);

  const setWeekdays = useCallback((weekdays: number[]) => {
    setFilters(prev => ({ ...prev, weekdays }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilter);
    setCurrentResultIndex(0);
  }, []);

  const goToNextResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentResultIndex(prev => (prev + 1) % searchResults.length);
  }, [searchResults.length]);

  const goToPrevResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentResultIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
  }, [searchResults.length]);

  return {
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
  };
}
