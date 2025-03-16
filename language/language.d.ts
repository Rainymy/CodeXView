export declare const LinguistLanguages: Record<string, Language>;

interface Language {
  name: string
  type: string
  color?: string
  extensions?: string[]
  tmScope: string
  aceMode: string
  languageId: number
  aliases?: string[]
  codemirrorMode?: string
  codemirrorMimeType?: string
  interpreters?: string[]
  group?: string
  filenames?: string[]
  wrap?: boolean
  fsName?: string
  searchable?: boolean
}

export = LinguistLanguages;
