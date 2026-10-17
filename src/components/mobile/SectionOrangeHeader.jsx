import AppleBackButton from './AppleBackButton'
import { useI18n } from '../../context/I18nContext'

/**
 * Branded orange top bar for marketplace sections opened from bottom nav.
 */
export default function SectionOrangeHeader({
  title,
  subtitle,
  onBack,
  backLabel,
  children,
  className = '',
}) {
  const { t } = useI18n()

  return (
    <header className={`section-orange-header ${className}`.trim()}>
      <div className="section-orange-header-row">
        {onBack ? (
          <AppleBackButton
            label={backLabel ?? t('back')}
            onClick={onBack}
            variant="onOrange"
            className="section-orange-back-wrap"
          />
        ) : (
          <span className="section-orange-spacer" aria-hidden />
        )}
        <div className="section-orange-titles">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className="section-orange-actions">
          {children || <span className="section-orange-spacer" aria-hidden />}
        </div>
      </div>
    </header>
  )
}
