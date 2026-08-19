import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTranslator, type UiLanguagePreference } from '@/lib/i18n'
import type { ThemeMode } from '@/lib/themeMode'

export function AppSettingsControls() {
  const { locale, settings, updateSettings } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label id="app-settings-theme-label">{t('settings.theme')}</Label>
        <Select value={settings.themeMode} onValueChange={(value) => updateSettings({ themeMode: value as ThemeMode })}>
          <SelectTrigger aria-labelledby="app-settings-theme-label" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">{t('settings.theme.light')}</SelectItem>
            <SelectItem value="dark">{t('settings.theme.dark')}</SelectItem>
            <SelectItem value="system">{t('settings.theme.system')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label id="app-settings-language-label">{t('settings.language')}</Label>
        <Select value={settings.uiLanguage} onValueChange={(value) => updateSettings({ uiLanguage: value as UiLanguagePreference })}>
          <SelectTrigger aria-labelledby="app-settings-language-label" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">{t('settings.language.system')}</SelectItem>
            <SelectItem value="en">{t('settings.language.english')}</SelectItem>
            <SelectItem value="vi">{t('settings.language.vietnamese')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
