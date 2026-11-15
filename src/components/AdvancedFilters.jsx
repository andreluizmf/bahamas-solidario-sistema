import React, { useState } from 'react';
import { Filter, X, Calendar, Tag } from 'lucide-react';

export function AdvancedFilters({ onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'recent'
  });

  function handleChange(field, value) {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }

  function clearFilters() {
    const cleared = {
      status: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'recent'
    };
    setFilters(cleared);
    onFilterChange(cleared);
  }

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all').length;

  return (
    <div className="filter-container">
      <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
        <Filter size={16} />
        Filtros avançados
        {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
      </button>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filtros</h3>
            <button onClick={() => setShowFilters(false)}><X size={18} /></button>
          </div>

          <div className="filter-group">
            <label>
              <Tag size={14} />
              Status
            </label>
            <select value={filters.status} onChange={(e) => handleChange('status', e.target.value)}>
              <option value="all">Todos</option>
              <option value="Ativa">Ativa</option>
              <option value="Concluída">Concluída</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <Tag size={14} />
              Categoria
            </label>
            <select value={filters.category} onChange={(e) => handleChange('category', e.target.value)}>
              <option value="all">Todas</option>
              <option value="Agasalhos">Agasalhos</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Brinquedos">Brinquedos</option>
              <option value="Livros">Livros</option>
              <option value="Higiene">Higiene</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <Calendar size={14} />
              Data inicial
            </label>
            <input 
              type="date" 
              value={filters.dateFrom} 
              onChange={(e) => handleChange('dateFrom', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>
              <Calendar size={14} />
              Data final
            </label>
            <input 
              type="date" 
              value={filters.dateTo} 
              onChange={(e) => handleChange('dateTo', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Ordenar por</label>
            <select value={filters.sortBy} onChange={(e) => handleChange('sortBy', e.target.value)}>
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="name">Nome (A-Z)</option>
              <option value="progress">Progresso</option>
            </select>
          </div>

          <button className="filter-clear" onClick={clearFilters}>
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}

export function applyFilters(items, filters, type = 'campaigns') {
  let filtered = [...items];

  if (type === 'campaigns') {
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(item => new Date(item.end) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => new Date(item.end) <= new Date(filters.dateTo));
    }

    // Ordenação
    switch(filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.end) - new Date(b.end));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.end) - new Date(a.end));
    }
  }

  return filtered;
}
