import type { ReactNode } from 'react'

type IconProps = {
  name: string
  size?: 16 | 20 | 24 | 32
  label?: string
}

export function Icon({ name, size = 24, label }: IconProps) {
  return (
    <span
      className="icon"
      style={{ fontSize: size, width: size, height: size }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  )
}

type ButtonProps = {
  children?: ReactNode
  kind?: 'primary' | 'secondary' | 'tertiary' | 'neutral'
  icon?: string
  iconOnly?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  ariaLabel?: string
}

export function Button({
  children,
  kind = 'primary',
  icon,
  iconOnly,
  disabled,
  type = 'button',
  onClick,
  ariaLabel,
}: ButtonProps) {
  const className = [
    'tg-button',
    'tg-button--md',
    `tg-button--${kind}`,
    iconOnly ? 'tg-button--icon' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon ? <Icon name={icon} size={24} /> : null}
      {iconOnly ? null : children}
    </button>
  )
}

type FieldProps = {
  id?: string
  label: string
  required?: boolean
  prefix?: string
  placeholder?: string
  value: string
  disabled?: boolean
  type?: 'text' | 'password'
  autoComplete?: string
  inputMode?: 'decimal' | 'numeric' | 'text'
  onChange?: (value: string) => void
}

export function Field({
  id,
  label,
  required,
  prefix,
  placeholder,
  value,
  disabled,
  type = 'text',
  autoComplete,
  inputMode,
  onChange,
}: FieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label className="tg-field" htmlFor={fieldId}>
      <span className="tg-field__label">
        {label}
        {required ? <span className="tg-field__req">*</span> : null}
      </span>
      <span className={`tg-input${disabled ? ' is-disabled' : ''}`}>
        {prefix ? <span className="tg-input__prefix">{prefix}</span> : null}
        <input
          id={fieldId}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </span>
    </label>
  )
}

type SelectFieldProps = {
  id?: string
  label: string
  required?: boolean
  value: string
  options: { value: string; label: string }[] | string[]
  placeholder?: string
  onChange: (value: string) => void
}

export function SelectField({
  id,
  label,
  required,
  value,
  options,
  placeholder,
  onChange,
}: SelectFieldProps) {
  const fieldId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`
  const normalized = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  )
  return (
    <label className="tg-field" htmlFor={fieldId}>
      <span className="tg-field__label">
        {label}
        {required ? <span className="tg-field__req">*</span> : null}
      </span>
      <span className="tg-input">
        <select id={fieldId} value={value} onChange={(event) => onChange(event.target.value)}>
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {normalized.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}

type SwitchProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      className={`tg-switch${checked ? ' is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="tg-switch__track" />
      {label}
    </button>
  )
}

type MessageProps = {
  title: string
  children: ReactNode
}

export function Message({ title, children }: MessageProps) {
  return (
    <aside className="tg-message">
      <div className="tg-message__body">
        <span className="tg-message__icon">
          <Icon name="info" />
        </span>
        <div>
          <p className="tg-message__title">{title}</p>
          <p className="tg-message__text">{children}</p>
        </div>
      </div>
    </aside>
  )
}
