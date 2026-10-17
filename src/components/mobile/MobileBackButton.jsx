import { useApp } from '../../context/AppContext'
import { useI18n } from '../../context/I18nContext'
import AppleBackButton from './AppleBackButton'

export default function MobileBackButton({ label, fallback = 'home', className = '', variant = 'default' }) {
  const { goBack } = useApp()
  const { t } = useI18n()
  const text = label ?? t('back')

  return (
    <AppleBackButton
      label={text}
      variant={variant}
      className={className}
      onClick={() => goBack(fallback)}
    />
  )
}
