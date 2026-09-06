export type UiLanguage = 'km' | 'vi' | 'en'

export const LANGUAGE_LABELS: Record<UiLanguage, string> = {
  km: 'ខ្មែរ',
  vi: 'Tiếng Việt',
  en: 'English',
}

export interface UiCopy {
  subtitle: string
  language: string
  match: string
  local: string
  vsAi: string
  aiDifficulty: string
  easy: string
  medium: string
  hard: string
  ruleset: string
  localMatch: string
  youAreWhite: string
  status: string
  whitePieces: string
  blackPieces: string
  moves: string
  lastRek: string
  lastPoat: string
  yes: string
  no: string
  undo: string
  reset: string
  white: string
  black: string
  king: string
  man: string
  empty: string
  legalDestination: string
  legalMove: string
  draw: string
  wins: string
  toMove: string
  aiThinking: string
  aiToMove: string
  localBoardLabel: string
  vsAiBoardLabel: string
  localHint: string
  vsAiHint: string
}

export const UI_COPY: Record<UiLanguage, UiCopy> = {
  km: {
    subtitle: 'លេងរែកខ្មែរ ក្នុងម៉ាស៊ីន ឬប្រកួតជាមួយ AI។',
    language: 'ភាសា',
    match: 'ការប្រកួត',
    local: 'លេងក្នុងម៉ាស៊ីន',
    vsAi: 'ទល់ AI',
    aiDifficulty: 'កម្រិត AI',
    easy: 'ងាយ',
    medium: 'មធ្យម',
    hard: 'ពិបាក',
    ruleset: 'ក្បួន',
    localMatch: 'លេងពីរនាក់',
    youAreWhite: 'អ្នកលេងកូនស',
    status: 'ស្ថានភាព',
    whitePieces: 'កូនស',
    blackPieces: 'កូនខ្មៅ',
    moves: 'ចំនួនទឹក',
    lastRek: 'រែកចុងក្រោយ',
    lastPoat: 'ព័ទ្ធចុងក្រោយ',
    yes: 'បាទ/ចាស',
    no: 'ទេ',
    undo: 'ថយក្រោយ',
    reset: 'ចាប់ផ្តើមឡើងវិញ',
    white: 'ស',
    black: 'ខ្មៅ',
    king: 'ស្តេច',
    man: 'កូន',
    empty: 'ទទេ',
    legalDestination: 'អាចដើរបាន',
    legalMove: 'ទឹកអាចដើរ',
    draw: 'ស្មើ',
    wins: 'ឈ្នះ',
    toMove: 'ដើរ',
    aiThinking: 'AI កំពុងគិត…',
    aiToMove: 'AI ត្រូវដើរ',
    localBoardLabel: 'ក្នុងម៉ាស៊ីន · 2 នាក់',
    vsAiBoardLabel: 'ទល់ AI',
    localHint: 'លេងទាំងពីរភាគីនៅលើឧបករណ៍នេះ។ ច្បាប់ និងការកាត់សេចក្ដីទាំងអស់មកពី engine។',
    vsAiHint: 'អ្នកលេងកូនស។ AI លេងកូនខ្មៅ ដោយប្រើ full state-aware engine search។',
  },
  vi: {
    subtitle: 'Chơi Rek Khmer tại chỗ hoặc đấu với AI của engine.',
    language: 'Ngôn ngữ',
    match: 'Trận đấu',
    local: 'Hai người',
    vsAi: 'Đấu AI',
    aiDifficulty: 'Độ khó AI',
    easy: 'Dễ',
    medium: 'Vừa',
    hard: 'Khó',
    ruleset: 'Bộ luật',
    localMatch: 'Trận hai người',
    youAreWhite: 'Bạn cầm Trắng',
    status: 'Trạng thái',
    whitePieces: 'Quân Trắng',
    blackPieces: 'Quân Đen',
    moves: 'Số nước',
    lastRek: 'Nước vừa Rek',
    lastPoat: 'Nước vừa Poat',
    yes: 'Có',
    no: 'Không',
    undo: 'Hoàn tác',
    reset: 'Ván mới',
    white: 'Trắng',
    black: 'Đen',
    king: 'Vua',
    man: 'Quân',
    empty: 'trống',
    legalDestination: 'ô đi hợp lệ',
    legalMove: 'Nước hợp lệ',
    draw: 'Hòa',
    wins: 'thắng',
    toMove: 'tới lượt',
    aiThinking: 'AI đang tính…',
    aiToMove: 'AI tới lượt',
    localBoardLabel: 'Local · 2 người',
    vsAiBoardLabel: 'Đấu AI',
    localHint: 'Hai bên chơi trên cùng thiết bị. Toàn bộ nước hợp lệ và phán quyết lấy từ engine.',
    vsAiHint: 'Bạn cầm Trắng. AI cầm Đen và tìm kiếm trên GameState đầy đủ của engine.',
  },
  en: {
    subtitle: 'Play Rek Khmer locally or challenge the engine AI.',
    language: 'Language',
    match: 'Match',
    local: 'Local',
    vsAi: 'vs AI',
    aiDifficulty: 'AI difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    ruleset: 'Ruleset',
    localMatch: 'Local match',
    youAreWhite: 'You are White',
    status: 'Status',
    whitePieces: 'White pieces',
    blackPieces: 'Black pieces',
    moves: 'Moves',
    lastRek: 'Last Rek',
    lastPoat: 'Last Poat',
    yes: 'Yes',
    no: 'No',
    undo: 'Undo',
    reset: 'Reset',
    white: 'White',
    black: 'Black',
    king: 'King',
    man: 'Man',
    empty: 'empty',
    legalDestination: 'legal destination',
    legalMove: 'Legal move',
    draw: 'Draw',
    wins: 'wins',
    toMove: 'to move',
    aiThinking: 'AI thinking…',
    aiToMove: 'AI to move',
    localBoardLabel: 'Local · 2 players',
    vsAiBoardLabel: 'vs AI',
    localHint: 'Both sides play on this device. All legality and adjudication come from the engine.',
    vsAiHint: 'You play White. The AI plays Black using full state-aware engine search.',
  },
}
