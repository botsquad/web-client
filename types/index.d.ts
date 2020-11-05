declare module '@botsquad/web-client' {
  export function processText(input: string): { __html: any }

  export const I18n = {
    resolveTranslations: (any, any) => any,
  }

  export type I18nValue = { $i18n: true }
  export type I18nArray = { [lang: string]: string[] } | I18nValue
}
