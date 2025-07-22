// src/hooks/admin/useEntityManagement.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePagination } from './usePagination';
import type { PageResponseDto, DeleteResponseDto } from '../../types/admin.types';

/**
 * Configuración para el hook de gestión de entidades.
 * Define cómo interactuar con el servicio y dónde navegar.
 */
interface EntityManagementConfig<T, CreateDto, UpdateDto> {
    // Servicio que implementa las operaciones CRUD
    service: {
        getAllStudents?: (params: any) => Promise<PageResponseDto<T>>;
        getAllTeachers?: (params: any) => Promise<PageResponseDto<T>>;
        getAllSubjects?: () => Promise<T[]>;
        createStudent?: (data: CreateDto) => Promise<T>;
        createTeacher?: (data: CreateDto) => Promise<T>;
        createSubject?: (data: CreateDto) => Promise<T>;
        updateStudent?: (id: number, data: UpdateDto) => Promise<T>;
        updateTeacher?: (id: number, data: UpdateDto) => Promise<T>;
        updateSubject?: (id: number, data: UpdateDto) => Promise<T>;
        deleteStudent?: (id: number) => Promise<DeleteResponseDto>;
        deleteTeacher?: (id: number) => Promise<DeleteResponseDto>;
        deleteSubject?: (id: number) => Promise<DeleteResponseDto>;
        [key: string]: any; // Para métodos adicionales específicos
    };

    // Tipo de entidad: determina qué métodos del servicio usar
    entityType: 'student' | 'teacher' | 'subject' | 'group';

    // Rutas para navegación después de operaciones
    routes: {
        list: string;      // Ruta de la lista (ej: /admin/students)
        create: string;    // Ruta del formulario de creación
        edit: string;      // Ruta del formulario de edición (con :id)
    };

    // Configuración de paginación inicial
    paginationConfig?: {
        initialSize?: number;
        initialSort?: string;
    };

    // Mensajes personalizados para feedback al usuario
    messages?: {
        createSuccess?: string;
        updateSuccess?: string;
        deleteSuccess?: string;
        deleteConfirm?: string;
    };
}

/**
 * Estado completo que maneja el hook.
 * Incluye datos, estados de carga y información de errores.
 */
interface EntityManagementState<T> {
    // Datos
    items: T[];                    // Lista de elementos actuales
    selectedItem: T | null;        // Elemento seleccionado para edición
    totalElements: number;         // Total de elementos en la BD

    // Estados de carga
    loading: boolean;              // Cargando lista inicial
    creating: boolean;             // Creando nueva entidad
    updating: boolean;             // Actualizando entidad
    deleting: number | null;       // ID de la entidad siendo eliminada

    // Manejo de errores
    error: string | null;          // Error general
    validationErrors: Record<string, string>; // Errores de validación por campo

    // Feedback
    successMessage: string | null; // Mensaje de éxito temporal
}

/**
 * Hook personalizado para gestión completa de entidades CRUD.
 *
 * Este hook abstrae toda la lógica común de las operaciones CRUD,
 * proporcionando una interfaz consistente para gestionar cualquier
 * tipo de entidad en el panel administrativo.
 *
 * Características principales:
 * - Gestión automática de estados de carga
 * - Manejo consistente de errores
 * - Integración con paginación
 * - Navegación automática después de operaciones
 * - Mensajes de confirmación y feedback
 * - Validación de formularios
 *
 * @example
 * ```typescript
 * const studentManagement = useEntityManagement({
 *   service: studentManagementService,
 *   entityType: 'student',
 *   routes: {
 *     list: '/admin/students',
 *     create: '/admin/students/new',
 *     edit: '/admin/students/:id/edit'
 *   }
 * });
 *
 * // En tu componente de lista
 * <DataTable
 *   data={studentManagement.items}
 *   onDelete={studentManagement.deleteItem}
 *   loading={studentManagement.loading}
 * />
 * ```
 */
export function useEntityManagement<T extends { id: number }, CreateDto, UpdateDto = Partial<CreateDto>>(
    config: EntityManagementConfig<T, CreateDto, UpdateDto>
) {
    const navigate = useNavigate();
    const { service, entityType, routes, messages } = config;

    // Hook de paginación
    const pagination = usePagination(config.paginationConfig);

    // Estado principal
    const [state, setState] = useState<EntityManagementState<T>>({
        items: [],
        selectedItem: null,
        totalElements: 0,
        loading: true,
        creating: false,
        updating: false,
        deleting: null,
        error: null,
        validationErrors: {},
        successMessage: null
    });

    /**
     * Mensajes por defecto según el tipo de entidad.
     * Se pueden sobrescribir con la configuración.
     */
    const defaultMessages = {
        student: {
            createSuccess: 'Estudiante creado exitosamente',
            updateSuccess: 'Estudiante actualizado exitosamente',
            deleteSuccess: 'Estudiante eliminado exitosamente',
            deleteConfirm: '¿Está seguro de eliminar este estudiante?'
        },
        teacher: {
            createSuccess: 'Profesor creado exitosamente',
            updateSuccess: 'Profesor actualizado exitosamente',
            deleteSuccess: 'Profesor eliminado exitosamente',
            deleteConfirm: '¿Está seguro de eliminar este profesor?'
        },
        subject: {
            createSuccess: 'Asignatura creada exitosamente',
            updateSuccess: 'Asignatura actualizada exitosamente',
            deleteSuccess: 'Asignatura eliminada exitosamente',
            deleteConfirm: '¿Está seguro de eliminar esta asignatura?'
        },
        group: {
            createSuccess: 'Grupo creado exitosamente',
            updateSuccess: 'Grupo actualizado exitosamente',
            deleteSuccess: 'Grupo eliminado exitosamente',
            deleteConfirm: '¿Está seguro de eliminar este grupo?'
        }
    };

    const entityMessages = {
        ...defaultMessages[entityType],
        ...messages
    };

    /**
     * Carga la lista de entidades con paginación.
     * Se adapta automáticamente al tipo de entidad.
     */
    const loadItems = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            let data: T[] = [];
            let totalElements = 0;

            // Diferentes estrategias según el tipo de entidad
            if (entityType === 'subject') {
                // Las asignaturas no tienen paginación
                const allSubjects = await service.getAllSubjects!();
                data = allSubjects;
                totalElements = allSubjects.length;
            } else {
                // Estudiantes y profesores usan paginación
                const methodName = `getAll${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s` as keyof typeof service;
                const response = await (service[methodName] as any)(pagination.getPageRequest());
                data = response.content;
                totalElements = response.totalElements;
                pagination.setTotalElements(response.totalElements);
            }

            setState(prev => ({
                ...prev,
                items: data,
                totalElements,
                loading: false
            }));

        } catch (error) {
            console.error(`Error loading ${entityType}s:`, error);
            setState(prev => ({
                ...prev,
                error: `Error al cargar ${entityType === 'student' ? 'estudiantes' :
                    entityType === 'teacher' ? 'profesores' : 'asignaturas'}`,
                loading: false
            }));
        }
    }, [entityType, service, pagination.getPageRequest, pagination.setTotalElements]);

    /**
     * Crea una nueva entidad.
     * Maneja validación, navegación y feedback.
     */
    const createItem = useCallback(async (data: CreateDto): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, creating: true, validationErrors: {} }));

            const methodName = `create${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` as keyof typeof service;
            await (service[methodName] as any)(data);

            setState(prev => ({
                ...prev,
                creating: false,
                successMessage: entityMessages.createSuccess
            }));

            // Navegar a la lista después de crear
            setTimeout(() => {
                navigate(routes.list);
            }, 1500);

            return true;

        } catch (error: any) {
            console.error(`Error creating ${entityType}:`, error);

            // Manejar errores de validación del backend
            if (error.response?.data?.fieldErrors) {
                setState(prev => ({
                    ...prev,
                    validationErrors: error.response.data.fieldErrors,
                    creating: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    error: error.response?.data?.message || `Error al crear ${entityType}`,
                    creating: false
                }));
            }

            return false;
        }
    }, [entityType, service, entityMessages.createSuccess, navigate, routes.list]);

    /**
     * Actualiza una entidad existente.
     * Similar a crear pero con ID.
     */
    const updateItem = useCallback(async (id: number, data: UpdateDto): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, updating: true, validationErrors: {} }));

            const methodName = `update${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` as keyof typeof service;
            await (service[methodName] as any)(id, data);

            setState(prev => ({
                ...prev,
                updating: false,
                successMessage: entityMessages.updateSuccess
            }));

            // Navegar a la lista después de actualizar
            setTimeout(() => {
                navigate(routes.list);
            }, 1500);

            return true;

        } catch (error: any) {
            console.error(`Error updating ${entityType}:`, error);

            if (error.response?.data?.fieldErrors) {
                setState(prev => ({
                    ...prev,
                    validationErrors: error.response.data.fieldErrors,
                    updating: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    error: error.response?.data?.message || `Error al actualizar ${entityType}`,
                    updating: false
                }));
            }

            return false;
        }
    }, [entityType, service, entityMessages.updateSuccess, navigate, routes.list]);

    /**
     * Elimina una entidad con confirmación.
     * Actualiza la lista automáticamente después.
     */
    const deleteItem = useCallback(async (id: number): Promise<boolean> => {
        // Confirmación del usuario
        if (!window.confirm(entityMessages.deleteConfirm)) {
            return false;
        }

        try {
            setState(prev => ({ ...prev, deleting: id }));

            const methodName = `delete${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` as keyof typeof service;
            await (service[methodName] as any)(id);

            setState(prev => ({
                ...prev,
                deleting: null,
                successMessage: entityMessages.deleteSuccess
            }));

            // Recargar la lista
            await loadItems();

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => {
                setState(prev => ({ ...prev, successMessage: null }));
            }, 3000);

            return true;

        } catch (error: any) {
            console.error(`Error deleting ${entityType}:`, error);

            setState(prev => ({
                ...prev,
                error: error.response?.data?.message || `Error al eliminar ${entityType}`,
                deleting: null
            }));

            return false;
        }
    }, [entityType, service, entityMessages, loadItems]);

    /**
     * Selecciona un item para edición.
     * Útil para formularios de edición.
     */
    const selectItem = useCallback((item: T | null) => {
        setState(prev => ({ ...prev, selectedItem: item }));
    }, []);

    /**
     * Limpia errores y mensajes.
     * Útil al cambiar de vista o cerrar modales.
     */
    const clearMessages = useCallback(() => {
        setState(prev => ({
            ...prev,
            error: null,
            successMessage: null,
            validationErrors: {}
        }));
    }, []);

    /**
     * Valida un campo específico.
     * Útil para validación en tiempo real en formularios.
     */
    const validateField = useCallback((fieldName: string, value: any, rules: any) => {
        // Aquí podrías implementar lógica de validación
        // Por ahora solo limpia el error del campo
        setState(prev => ({
            ...prev,
            validationErrors: {
                ...prev.validationErrors,
                [fieldName]: ''
            }
        }));
    }, []);

    // Retornar lo necesario para gestionar la entidad
    return {
        // Estado
        ...state,

        // Paginación
        pagination,

        // Operaciones CRUD
        loadItems,
        createItem,
        updateItem,
        deleteItem,
        selectItem,

        // Utilidades
        clearMessages,
        validateField,

        // Navegación
        navigateToCreate: () => navigate(routes.create),
        navigateToEdit: (id: number) => navigate(routes.edit.replace(':id', id.toString())),
        navigateToList: () => navigate(routes.list)
    };
}