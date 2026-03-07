import { useState, useMemo, useCallback } from 'react';
import type { ParsedMessage, FilterState, ContentType } from '../types';

const initialFilter: FilterState = {
  searchTerm: '',
  senders: [],
  dateStart: '',
  dateEnd: '',
  contentTypes: [],
};

export function useSearch(messages: ParsedMessage[]) {
  const [filters, setFilters] = useState<FilterState>(initialFilter);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  const filteredMessages = useMemo(() => {
    let result = messages;

    // Filtro por remetente
    if (filters.senders.length > 0) {
      result = result.filter(m => filters.senders.includes(m.sender));
    }

    // Filtro por período
    if (filters.dateStart) {
      result = result.filter(m => {
        const [d, mo, y] = m.date.split('/').map(Number);
        const [sd, smo, sy] = filters.dateStart.split('/').map(Number);
        const msgDate = new Date(y, mo - 1, d);
        const startDate = new Date(sy, smo - 1, sd);
        return msgDate >= startDate;
      });
    }

    if (filters.dateEnd) {
      result = result.filter(m => {
        const [d, mo, y] = m.date.split('/').map(Number);
        const [ed, emo, ey] = filters.dateEnd.split('/').map(Number);
        const msgDate = new Date(y, mo - 1, d);
        const endDate = new Date(ey, emo - 1, ed);
        return msgDate <= endDate;
      });
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
  }, [messages, filters.senders, filters.dateStart, filters.dateEnd, filters.contentTypes]);

  // Resultados da busca (índices das mensagens que contêm o termo)
  const searchResults = useMemo(() => {
    if (!filters.searchTerm.trim()) return [];
    const term = filters.searchTerm.toLowerCase();
    return filteredMessages
      .map((msg, index) => ({ msg, index }))
      .filter(({ msg }) => msg.text.toLowerCase().includes(term))
      .map(({ index }) => index);
  }, [filteredMessages, filters.searchTerm]);

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
    clearFilters,
    goToNextResult,
    goToPrevResult,
  };
}
