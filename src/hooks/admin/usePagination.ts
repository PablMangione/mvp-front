// src/hooks/admin/usePagination.ts
import { useState, useCallback, useMemo } from 'react';
import type { PageRequest } from '../../types/admin.types';

/**
 * Configuración inicial para el hook de paginación.
 * Permite personalizar el comportamiento según las necesidades
 * de cada componente que lo utilice.
 */
interface UsePaginationConfig {
    initialPage?: number;      // Página inicial (por defecto 0)
    initialSize?: number;      // Tamaño de página inicial (por defecto 10)
    initialSort?: string;      // Ordenamiento inicial (ej: "name,asc")
}

/**
 * Estado completo de la paginación que retorna el hook.
 * Incluye toda la información necesaria para renderizar controles
 * de paginación y mostrar información al usuario.
 */
interface PaginationState {
    currentPage: number;       // Página actual (0-based como Spring)
    pageSize: number;          // Elementos por página
    totalElements: number;     // Total de elementos en la base de datos
    totalPages: number;        // Total de páginas disponibles
    sort: string | undefined;  // String de ordenamiento actual
}

/**
 * Hook personalizado para gestión de paginación.
 *
 * Este hook abstrae toda la complejidad de manejar paginación,
 * proporcionando una interfaz simple y consistente. Está diseñado
 * para trabajar perfectamente con el backend de Spring Data.
 *
 * Características principales:
 * - Maneja el estado de paginación de forma centralizada
 * - Proporciona funciones para navegar entre páginas
 * - Calcula automáticamente rangos y límites
 * - Genera objetos PageRequest para las APIs
 * - Previene navegación a páginas inválidas
 *
 * @example
 * ```typescript
 * const pagination = usePagination({ initialSize: 20 });
 *
 * // En tu función de carga de datos
 * const data = await service.getAll(pagination.getPageRequest());
 * pagination.setTotalElements(data.totalElements);
 *
 * // En tu UI
 * <Pagination
 *   currentPage={pagination.currentPage + 1} // Convertir a 1-based para UI
 *   totalPages={pagination.totalPages}
 *   onPageChange={(page) => pagination.goToPage(page - 1)} // Convertir a 0-based
 * />
 * ```
 */
export const usePagination = (config: UsePaginationConfig = {}) => {
    // Valores por defecto que coinciden con las expectativas comunes del backend
    const {
        initialPage = 0,
        initialSize = 10,
        initialSort
    } = config;

    // Estado principal de paginación
    const [state, setState] = useState<PaginationState>({
        currentPage: initialPage,
        pageSize: initialSize,
        totalElements: 0,
        totalPages: 0,
        sort: initialSort
    });

    /**
     * Navega a una página específica.
     * Incluye validación para evitar navegación a páginas inválidas.
     *
     * @param page - Número de página (0-based)
     */
    const goToPage = useCallback((page: number) => {
        setState(prev => {
            // Validar que la página esté en rango válido
            const validPage = Math.max(0, Math.min(page, prev.totalPages - 1));

            // Solo actualizar si realmente cambió
            if (validPage !== prev.currentPage) {
                return { ...prev, currentPage: validPage };
            }
            return prev;
        });
    }, []);

    /**
     * Navega a la página siguiente.
     * No hace nada si ya estamos en la última página.
     */
    const nextPage = useCallback(() => {
        setState(prev => {
            if (prev.currentPage < prev.totalPages - 1) {
                return { ...prev, currentPage: prev.currentPage + 1 };
            }
            return prev;
        });
    }, []);

    /**
     * Navega a la página anterior.
     * No hace nada si ya estamos en la primera página.
     */
    const previousPage = useCallback(() => {
        setState(prev => {
            if (prev.currentPage > 0) {
                return { ...prev, currentPage: prev.currentPage - 1 };
            }
            return prev;
        });
    }, []);

    /**
     * Cambia el tamaño de página (elementos por página).
     * Automáticamente recalcula la página actual para mantener
     * aproximadamente los mismos elementos visibles.
     *
     * @param size - Nuevo tamaño de página
     */
    const setPageSize = useCallback((size: number) => {
        setState(prev => {
            // Calcular en qué elemento estamos actualmente
            const firstElementIndex = prev.currentPage * prev.pageSize;

            // Calcular la nueva página para mantener el mismo elemento visible
            const newPage = Math.floor(firstElementIndex / size);

            // Recalcular total de páginas
            const newTotalPages = Math.ceil(prev.totalElements / size);

            return {
                ...prev,
                pageSize: size,
                currentPage: Math.min(newPage, Math.max(0, newTotalPages - 1)),
                totalPages: newTotalPages
            };
        });
    }, []);

    /**
     * Actualiza el total de elementos.
     * Típicamente se llama después de recibir datos del backend.
     * Recalcula automáticamente el total de páginas.
     *
     * @param total - Número total de elementos
     */
    const setTotalElements = useCallback((total: number) => {
        setState(prev => {
            const newTotalPages = Math.ceil(total / prev.pageSize);

            // Ajustar página actual si excede el nuevo límite
            const validCurrentPage = Math.min(prev.currentPage, Math.max(0, newTotalPages - 1));

            return {
                ...prev,
                totalElements: total,
                totalPages: newTotalPages,
                currentPage: validCurrentPage
            };
        });
    }, []);

    /**
     * Cambia el ordenamiento actual.
     * El formato debe ser compatible con Spring Data (ej: "name,asc" o "createdAt,desc")
     *
     * @param sort - String de ordenamiento o undefined para sin orden
     */
    const setSort = useCallback((sort: string | undefined) => {
        setState(prev => ({
            ...prev,
            sort,
            currentPage: 0 // Volver a la primera página al cambiar el orden
        }));
    }, []);

    /**
     * Resetea la paginación a su estado inicial.
     * Útil cuando se cambian filtros o se necesita empezar de nuevo.
     */
    const reset = useCallback(() => {
        setState({
            currentPage: initialPage,
            pageSize: initialSize,
            totalElements: 0,
            totalPages: 0,
            sort: initialSort
        });
    }, [initialPage, initialSize, initialSort]);

    /**
     * Genera un objeto PageRequest para enviar al backend.
     * Este objeto tiene el formato esperado por los servicios.
     */
    const getPageRequest = useCallback((): PageRequest => {
        const request: PageRequest = {
            page: state.currentPage,
            size: state.pageSize
        };

        // Solo incluir sort si está definido
        if (state.sort) {
            request.sort = state.sort;
        }

        return request;
    }, [state.currentPage, state.pageSize, state.sort]);

    /**
     * Calcula el rango de elementos mostrados actualmente.
     * Útil para mostrar "Mostrando 1-10 de 100 elementos"
     */
    const currentRange = useMemo(() => {
        if (state.totalElements === 0) {
            return { start: 0, end: 0 };
        }

        const start = state.currentPage * state.pageSize + 1;
        const end = Math.min(
            (state.currentPage + 1) * state.pageSize,
            state.totalElements
        );

        return { start, end };
    }, [state.currentPage, state.pageSize, state.totalElements]);

    /**
     * Flags útiles para habilitar/deshabilitar controles en la UI
     */
    const flags = useMemo(() => ({
        isFirstPage: state.currentPage === 0,
        isLastPage: state.currentPage === state.totalPages - 1 || state.totalPages === 0,
        hasMultiplePages: state.totalPages > 1,
        isEmpty: state.totalElements === 0
    }), [state.currentPage, state.totalPages, state.totalElements]);

    return {
        // Estado actual
        ...state,

        // Navegación
        goToPage,
        nextPage,
        previousPage,

        // Configuración
        setPageSize,
        setTotalElements,
        setSort,
        reset,

        // Utilidades
        getPageRequest,
        currentRange,

        // Flags de estado
        ...flags
    };
};