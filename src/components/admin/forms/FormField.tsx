// src/components/admin/forms/FormField.tsx
import React, { forwardRef, useId } from 'react';
import './FormField.css';

/**
 * Tipos de input soportados por FormField.
 * Cada tipo tiene comportamientos y validaciones específicas.
 */
type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';

/**
 * Props base compartidas por todos los tipos de FormField.
 * Estas propiedades son comunes sin importar si es un input, select o textarea.
 */
interface FormFieldBaseProps {
    // Identificación y etiquetado
    label: string;                    // Etiqueta visible del campo
    name: string;                     // Nombre del campo para el formulario
    id?: string;                      // ID único (se genera automáticamente si no se proporciona)

    // Estado y validación
    error?: string;                   // Mensaje de error a mostrar
    touched?: boolean;                // ¿Ha sido tocado el campo? (para mostrar errores)
    required?: boolean;               // ¿Es campo obligatorio?
    disabled?: boolean;               // ¿Está deshabilitado?

    // Ayuda y descripción
    placeholder?: string;             // Texto de placeholder
    helperText?: string;              // Texto de ayuda debajo del campo

    // Layout y estilo
    fullWidth?: boolean;              // ¿Ocupa todo el ancho disponible?
    className?: string;               // Clases CSS adicionales
}

/**
 * Props específicas para campos de tipo input.
 * Extiende las props base con características específicas de inputs HTML.
 */
interface InputFieldProps extends FormFieldBaseProps {
    type?: InputType;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    pattern?: string;
    autoComplete?: string;
    autoFocus?: boolean;
}

/**
 * Props específicas para campos select.
 * Maneja listas desplegables con opciones predefinidas.
 */
interface SelectFieldProps extends FormFieldBaseProps {
    type: 'select';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
    options: Array<{
        value: string;
        label: string;
        disabled?: boolean;
    }>;
    multiple?: boolean;
}

/**
 * Props específicas para campos textarea.
 * Para entrada de texto multilínea.
 */
interface TextareaFieldProps extends FormFieldBaseProps {
    type: 'textarea';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    maxLength?: number;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Union type que combina todos los tipos posibles de FormField.
 * TypeScript usará discriminated unions para inferir el tipo correcto.
 */
type FormFieldProps = InputFieldProps | SelectFieldProps | TextareaFieldProps;

/**
 * Componente FormField - El bloque de construcción fundamental para formularios.
 *
 * Este componente encapsula la complejidad de crear campos de formulario accesibles
 * y consistentes. Maneja automáticamente:
 *
 * 1. **Accesibilidad**: IDs únicos, asociación label-input, ARIA attributes
 * 2. **Estados visuales**: Normal, focus, error, disabled
 * 3. **Validación**: Muestra errores de forma consistente
 * 4. **Responsive**: Se adapta a diferentes tamaños de pantalla
 * 5. **Flexibilidad**: Soporta diferentes tipos de campos
 *
 * El componente utiliza forwardRef para permitir que los formularios
 * accedan directamente al elemento del DOM cuando sea necesario.
 *
 * @example
 * ```typescript
 * // Input de texto simple
 * <FormField
 *   label="Nombre"
 *   name="name"
 *   value={formData.name}
 *   onChange={handleChange}
 *   error={errors.name}
 *   required
 * />
 *
 * // Select con opciones
 * <FormField
 *   type="select"
 *   label="Carrera"
 *   name="major"
 *   value={formData.major}
 *   onChange={handleChange}
 *   options={[
 *     { value: '', label: 'Seleccione...' },
 *     { value: 'ing-sistemas', label: 'Ingeniería en Sistemas' },
 *     { value: 'ing-civil', label: 'Ingeniería Civil' }
 *   ]}
 *   required
 * />
 *
 * // Textarea para comentarios
 * <FormField
 *   type="textarea"
 *   label="Descripción"
 *   name="description"
 *   value={formData.description}
 *   onChange={handleChange}
 *   rows={4}
 *   helperText="Máximo 500 caracteres"
 * />
 * ```
 */
export const FormField = forwardRef<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    FormFieldProps
>((props, ref) => {
    // Generar un ID único si no se proporciona uno
    // Esto es crucial para la accesibilidad (asociar label con input)
    const generatedId = useId();
    const fieldId = props.id || `field-${generatedId}`;

    // Determinar las clases CSS basadas en el estado
    const containerClasses = [
        'form-field',
        props.fullWidth && 'form-field--full-width',
        props.error && props.touched && 'form-field--error',
        props.disabled && 'form-field--disabled',
        props.className
    ].filter(Boolean).join(' ');

    /**
     * Renderiza el componente de input apropiado según el tipo.
     * Esta función es el corazón del componente, determinando qué
     * elemento HTML renderizar basándose en las props.
     */
    const renderField = () => {
        // Para campos select
        if (props.type === 'select') {
            const { options, multiple, ...selectProps } = props;
            return (
                <select
                    ref={ref as React.Ref<HTMLSelectElement>}
                    id={fieldId}
                    className="form-field__input form-field__select"
                    aria-invalid={!!(props.error && props.touched)}
                    aria-describedby={
                        props.error && props.touched ? `${fieldId}-error` :
                            props.helperText ? `${fieldId}-helper` : undefined
                    }
                    {...selectProps}
                >
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        // Para campos textarea
        if (props.type === 'textarea') {
            const { rows = 3, resize = 'vertical', maxLength, ...textareaProps } = props;
            return (
                <textarea
                    ref={ref as React.Ref<HTMLTextAreaElement>}
                    id={fieldId}
                    className="form-field__input form-field__textarea"
                    rows={rows}
                    maxLength={maxLength}
                    style={{ resize }}
                    aria-invalid={!!(props.error && props.touched)}
                    aria-describedby={
                        props.error && props.touched ? `${fieldId}-error` :
                            props.helperText ? `${fieldId}-helper` : undefined
                    }
                    {...textareaProps}
                />
            );
        }

        // Para campos input (tipo por defecto)
        const { type = 'text', ...inputProps } = props as InputFieldProps;
        return (
            <input
                ref={ref as React.Ref<HTMLInputElement>}
                id={fieldId}
                type={type}
                className="form-field__input"
                aria-invalid={!!(props.error && props.touched)}
                aria-describedby={
                    props.error && props.touched ? `${fieldId}-error` :
                        props.helperText ? `${fieldId}-helper` : undefined
                }
                {...inputProps}
            />
        );
    };

    /**
     * Renderiza el componente completo con label, campo y mensajes.
     * La estructura sigue las mejores prácticas de accesibilidad y UX.
     */
    return (
        <div className={containerClasses}>
            {/* Label del campo - siempre visible para accesibilidad */}
            <label htmlFor={fieldId} className="form-field__label">
                {props.label}
                {props.required && (
                    <span className="form-field__required" aria-label="requerido">
                        *
                    </span>
                )}
            </label>

            {/* Contenedor del input para aplicar estilos consistentes */}
            <div className="form-field__input-wrapper">
                {renderField()}

                {/* Indicador visual de estado de error */}
                {props.error && props.touched && (
                    <span className="form-field__error-icon" aria-hidden="true">
                        ⚠️
                    </span>
                )}
            </div>

            {/* Mensajes debajo del campo */}
            {/* Texto de ayuda - siempre visible si existe */}
            {props.helperText && !props.error && (
                <p id={`${fieldId}-helper`} className="form-field__helper-text">
                    {props.helperText}
                </p>
            )}

            {/* Mensaje de error - solo visible cuando hay error y el campo fue tocado */}
            {props.error && props.touched && (
                <p id={`${fieldId}-error`} className="form-field__error-message" role="alert">
                    {props.error}
                </p>
            )}
        </div>
    );
});

// Importante para debugging en React DevTools
FormField.displayName = 'FormField';

/**
 * Hook personalizado para gestionar el estado de un formulario.
 * Este es un helper opcional que simplifica el manejo de formularios.
 *
 * @example
 * ```typescript
 * const { values, errors, touched, handleChange, handleBlur, setFieldError } = useFormField({
 *   initialValues: { name: '', email: '' },
 *   validate: (values) => {
 *     const errors = {};
 *     if (!values.name) errors.name = 'El nombre es requerido';
 *     if (!values.email) errors.email = 'El email es requerido';
 *     return errors;
 *   }
 * });
 * ```
 */
export const useFormField = <T extends Record<string, any>>(config: {
    initialValues: T;
    validate?: (values: T) => Partial<Record<keyof T, string>>;
}) => {
    const [values, setValues] = React.useState<T>(config.initialValues);
    const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});

    const handleChange = React.useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        setValues(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));

        // Limpiar error cuando el usuario empieza a escribir
        if (errors[name as keyof T]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const handleBlur = React.useCallback((
        e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        // Validar campo individual si hay función de validación
        if (config.validate) {
            const validationErrors = config.validate(values);
            if (validationErrors[name as keyof T]) {
                setErrors(prev => ({ ...prev, [name]: validationErrors[name as keyof T] }));
            }
        }
    }, [values, config.validate]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldError: (field: keyof T, error: string) => {
            setErrors(prev => ({ ...prev, [field]: error }));
            setTouched(prev => ({ ...prev, [field]: true }));
        },
        resetForm: () => {
            setValues(config.initialValues);
            setErrors({});
            setTouched({});
        }
    };
};