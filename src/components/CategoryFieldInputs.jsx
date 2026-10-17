/** Renders dynamic fields from categoryConfig */

export function CategoryFieldInputs({ fields, values, onChange, className = '' }) {
  if (!fields?.length) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {fields.map((field) => (
        <div key={field.id}>
          <label className="text-xs font-semibold text-divar-text-secondary mb-1.5 block">
            {field.label}
            {field.required && <span className="text-divar-red"> *</span>}
          </label>

          {field.type === 'chips' && (
            <div className="flex flex-wrap gap-1.5">
              {field.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(field.id, opt)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                    values[field.id] === opt
                      ? 'bg-divar-red text-white border-divar-red'
                      : 'bg-divar-surface border-divar-border text-divar-text-secondary'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {field.type === 'select' && (
            <select
              value={values[field.id] ?? ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-full bg-divar-bg border border-divar-border rounded-lg px-3 py-2.5 text-sm"
            >
              {!field.required && <option value="">Select…</option>}
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {(field.type === 'text' || field.type === 'number') && (
            <input
              type={field.type}
              required={field.required}
              value={values[field.id] ?? ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="dv-search w-full px-4 py-2.5 text-sm"
            />
          )}

          {field.type === 'checkbox' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!values[field.id]}
                onChange={(e) => onChange(field.id, e.target.checked)}
                className="accent-[#c62828] w-4 h-4"
              />
              <span className="text-sm text-divar-text">{field.label}</span>
            </label>
          )}
        </div>
      ))}
    </div>
  )
}
