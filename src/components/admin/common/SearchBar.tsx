// src/components/admin/common/SearchBar.tsx
import React, { useState, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    debounceMs?: number;
    className?: string;
    showButton?: boolean;
    autoFocus?: boolean;
}

/**
 * Barra de búsqueda con debounce para el panel de administración.
 * Optimiza las búsquedas retrasando la ejecución hasta que el usuario deje de escribir.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
                                                        placeholder = 'Buscar...',
                                                        onSearch,
                                                        debounceMs = 300,
                                                        className = '',
                                                        showButton = false,
                                                        autoFocus = false
                                                    }) => {
    const [query, setQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTyping(false);
            onSearch(query);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [query, debounceMs, onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setIsTyping(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsTyping(false);
        onSearch(query);
    };

    const handleClear = () => {
        setQuery('');
        setIsTyping(false);
        onSearch('');
    };

    return (
        <form
            className={`search-bar ${className}`}
            onSubmit={handleSubmit}
            role="search"
        >
            <div className="search-bar__container">
                <span className="search-bar__icon" aria-hidden="true">
                    🔍
                </span>
                <input
                    type="text"
                    className="search-bar__input"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleChange}
                    autoFocus={autoFocus}
                    aria-label="Campo de búsqueda"
                />
                {query && (
                    <button
                        type="button"
                        className="search-bar__clear"
                        onClick={handleClear}
                        aria-label="Limpiar búsqueda"
                    >
                        ×
                    </button>
                )}
                {isTyping && (
                    <span className="search-bar__typing-indicator" aria-hidden="true" />
                )}
            </div>
            {showButton && (
                <button
                    type="submit"
                    className="search-bar__button"
                    aria-label="Buscar"
                >
                    Buscar
                </button>
            )}
        </form>
    );
};