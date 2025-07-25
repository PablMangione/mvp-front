export const GROUP_TYPES = [
    { value: 'REGULAR', label: 'Regular' },
    { value: 'INTENSIVE', label: 'Intensivo'}
] as const;

export const GROUP_STATUSES = [
    { value: 'PLANNED', label: 'Planificado'},
    { value: 'ACTIVE', label: 'Activo'},
    { value: 'CLOSED', label: 'Cerrado' },
] as const;

export const DAYS_OF_WEEK = [
    { value: 'MONDAY', label: 'Lunes', shortLabel: 'Lun', order: 1 },
    { value: 'TUESDAY', label: 'Martes', shortLabel: 'Mar', order: 2 },
    { value: 'WEDNESDAY', label: 'Miércoles', shortLabel: 'Mié', order: 3 },
    { value: 'THURSDAY', label: 'Jueves', shortLabel: 'Jue', order: 4 },
    { value: 'FRIDAY', label: 'Viernes', shortLabel: 'Vie', order: 5 },
    { value: 'SATURDAY', label: 'Sábado', shortLabel: 'Sáb', order: 6 },
    { value: 'SUNDAY', label: 'Domingo', shortLabel: 'Dom', order: 7 }
] as const;

export const SESSION_DURATIONS = [
    { value: 60, label: '1 hora' },
    { value: 90, label: '1 hora 30 minutos' },
    { value: 120, label: '2 horas' }
] as const;

export const CLASSROOMS = [
    { value: 'AULA 1', label: 'Portal 1 1ºAI' },
    { value: 'AULA 2', label: 'Portal 2 1ºAD' }
] as const;

export const COURSE_YEARS = [
    { value: 1, label: '1° Año' },
    { value: 2, label: '2° Año' },
    { value: 3, label: '3° Año' },
    { value: 4, label: '4° Año' }
] as const;

export const MAJORS = [
    {value: 'ING_INF', label: 'Ingeniería informática'},
    {value: 'ING_IND', label: 'Ingeniería industrial'}
] as const

export const REQUEST_STATUSES = [
    {value: 'PENDING', label: 'Pendiente' },
    {value: 'APPROVED', label: 'Aprobada' },
    {value: 'REJECTED', label: 'Rechazada' },
] as const

export const PAYMENT_STATUSES = [
    {value: 'PENDING', label: 'Pendiente' },
    {value: 'PAID', label: 'Pagada' },
    {value: 'FAILED', label: 'Errónea' },
] as const