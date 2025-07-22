// src/components/common/Pagination.tsx
import React from 'react';
import './Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    className?: string;
}

/**
 * Componente de paginación.
 * Usado en todas las listas y tablas que requieren navegación entre páginas.
 * Muestra botones de navegación y números de página con ellipsis inteligente.
 */
export const Pagination: React.FC<PaginationProps> = ({
                                                          currentPage,
                                                          totalPages,
                                                          totalElements,
                                                          onPageChange,
                                                          siblingCount = 1,
                                                          className = ''
                                                      }) => {
    // Generar rango de páginas a mostrar
    const range = (start: number, end: number) => {
        const length = end - start + 1;
        return Array.from({ length }, (_, idx) => idx + start);
    };

    const generatePagination = () => {
        const totalPageNumbers = siblingCount * 2 + 5; // First, Last, Current, 2*Siblings, 2*Dots

        // Si el total de páginas es menor que los números a mostrar, mostrar todos
        if (totalPages <= totalPageNumbers) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftItemCount = 3 + 2 * siblingCount;
            const leftRange = range(1, leftItemCount);
            return [...leftRange, '...', totalPages];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = 3 + 2 * siblingCount;
            const rightRange = range(totalPages - rightItemCount + 1, totalPages);
            return [1, '...', ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [1, '...', ...middleRange, '...', totalPages];
        }

        return [];
    };

    const pages = generatePagination();

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={`pagination ${className}`}>
            <div className="pagination__info">
                Mostrando página {currentPage} de {totalPages} ({totalElements} elementos)
            </div>

            <nav className="pagination__nav" aria-label="Paginación">
                <button
                    className="pagination__button pagination__button--prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                >
                    <span aria-hidden="true">←</span> Anterior
                </button>

                <div className="pagination__pages">
                    {pages.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`dots-${index}`} className="pagination__dots">
                                    ⋯
                                </span>
                            );
                        }

                        const pageNumber = page as number;
                        return (
                            <button
                                key={pageNumber}
                                className={`pagination__page ${
                                    currentPage === pageNumber ? 'pagination__page--active' : ''
                                }`}
                                onClick={() => handlePageChange(pageNumber)}
                                aria-label={`Ir a página ${pageNumber}`}
                                aria-current={currentPage === pageNumber ? 'page' : undefined}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}
                </div>

                <button
                    className="pagination__button pagination__button--next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                >
                    Siguiente <span aria-hidden="true">→</span>
                </button>
            </nav>
        </div>
    );
};