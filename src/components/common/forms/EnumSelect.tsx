// src/components/common/forms/EnumSelect.tsx

import React from 'react';

/**
 * Tipo que define la estructura de una opción en nuestro select.
 * Esta estructura es consistente en toda la aplicación:
 * - value: El valor que se envía al backend (ej: 'MONDAY')
 * - label: Lo que ve el usuario (ej: 'Lunes')
 */
export interface SelectOption {
    value: string;
    label: string;
}

/**
 * Props del componente EnumSelect.
 * Diseñado para ser flexible y reutilizable en cualquier contexto.
 */
export interface EnumSelectProps {
    // Datos básicos
    options: SelectOption[];          // Array de opciones disponibles
    value: string;                    // Valor actualmente seleccionado
    onChange: (value: string) => void; // Callback cuando cambia la selección

    // Información visual
    label?: string;                   // Etiqueta del campo
    placeholder?: string;             // Texto cuando no hay selección

    // Validación y estado
    required?: boolean;               // ¿Es campo obligatorio?
    disabled?: boolean;               // ¿Está deshabilitado?
    error?: string;                   // Mensaje de error a mostrar

    // Identificación y accesibilidad
    id?: string;                      // ID único para el elemento
    name?: string;                    // Nombre del campo en formularios
    className?: string;               // Clases CSS adicionales

    // Comportamiento
    clearable?: boolean;              // ¿Permite limpiar la selección?
}

/**
 * EnumSelect: Componente genérico para seleccionar valores de enum.
 *
 * Este componente resuelve el problema de sincronización entre frontend y backend
 * al garantizar que solo se puedan seleccionar valores válidos predefinidos.
 *
 * Principios de diseño:
 * 1. Imposibilita errores: El usuario no puede escribir valores incorrectos
 * 2. Mejor UX: Muestra labels amigables mientras usa valores técnicos
 * 3. Accesible: Incluye labels, ARIA attributes y manejo de teclado
 * 4. Flexible: Se adapta a cualquier enum de la aplicación
 */
export const EnumSelect: React.FC<EnumSelectProps> = ({
                                                          options,
                                                          value,
                                                          onChange,
                                                          label,
                                                          placeholder = "-- Seleccione una opción --",
                                                          required = false,
                                                          disabled = false,
                                                          error,
                                                          id,
                                                          name,
                                                          className = '',
                                                          clearable = false
                                                      }) => {
    // Generar un ID único si no se proporciona uno
    // Esto es importante para la accesibilidad (asociar label con input)
    const inputId = id || `enum-select-${Math.random().toString(36).substr(2, 9)}`;

    /**
     * Manejador del evento onChange del select.
     * Extrae el valor y llama al callback del padre.
     */
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        onChange(newValue);
    };

    /**
     * Determina las clases CSS del select basándose en su estado.
     * Esto permite estilos diferentes para estados normal, error, deshabilitado, etc.
     */
    const selectClasses = `
        enum-select
        ${error ? 'enum-select--error' : ''}
        ${disabled ? 'enum-select--disabled' : ''}
        ${className}
    `.trim();

    /**
     * Verifica si el valor actual es válido.
     * Útil para mostrar el placeholder cuando no hay selección válida.
     */
    const isValidValue = value && options.some(opt => opt.value === value);

    return (
        <div className="enum-select-container">
            {/* Label del campo - importante para accesibilidad */}
            {label && (
                <label
                    htmlFor={inputId}
                    className="enum-select-label"
                >
                    {label}
                    {required && <span className="enum-select-required" aria-label="requerido">*</span>}
                </label>
            )}

            {/* Select principal */}
            <select
                id={inputId}
                name={name}
                value={isValidValue ? value : ''}
                onChange={handleChange}
                disabled={disabled}
                required={required}
                className={selectClasses}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
            >
                {/* Opción placeholder - se muestra cuando no hay selección */}
                {(!required || clearable || !isValidValue) && (
                    <option value="">
                        {placeholder}
                    </option>
                )}

                {/* Renderizar todas las opciones disponibles */}
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {/* Mensaje de error - importante para feedback al usuario */}
            {error && (
                <span
                    id={`${inputId}-error`}
                    className="enum-select-error"
                    role="alert"
                >
                    {error}
                </span>
            )}
        </div>
    );
};

// Exportación nombrada adicional para mayor flexibilidad en imports
export default EnumSelect;