export interface ScryfallImageUris {
  small?: string
  normal?: string
  large?: string
  png?: string
  art_crop?: string
  border_crop?: string
}

export interface ScryfallCardFace {
  object: 'card_face'
  name: string
  mana_cost: string
  type_line?: string
  oracle_text?: string
  flavor_text?: string
  colors?: string[]
  power?: string
  toughness?: string
  loyalty?: string
  defense?: string
  artist?: string
  artist_id?: string
  illustration_id?: string
  image_uris?: ScryfallImageUris
}

export interface ScryfallLegalities {
  standard?: string
  future?: string
  historic?: string
  timeless?: string
  gladiator?: string
  pioneer?: string
  explorer?: string
  modern?: string
  legacy?: string
  pauper?: string
  vintage?: string
  penny?: string
  commander?: string
  oathbreaker?: string
  brawl?: string
  alchemy?: string
  paupercommander?: string
  duel?: string
  oldschool?: string
  premodern?: string
  predh?: string
}

export interface ScryfallPrices {
  usd?: string | null
  usd_foil?: string | null
  usd_etched?: string | null
  eur?: string | null
  eur_foil?: string | null
  tix?: string | null
}

export interface ScryfallPurchaseUris {
  tcgplayer?: string
  cardmarket?: string
  cardhoarder?: string
}

export interface ScryfallCard {
  object: 'card'
  id: string
  oracle_id?: string
  multiverse_ids?: number[]
  mtgo_id?: number
  arena_id?: number
  name: string
  lang: string
  released_at: string
  uri: string
  scryfall_uri: string
  layout: string
  highres_image: boolean
  image_status: string
  image_uris?: ScryfallImageUris
  mana_cost?: string
  cmc: number
  type_line: string
  oracle_text?: string
  flavor_text?: string
  colors?: string[]
  color_identity: string[]
  keywords?: string[]
  power?: string
  toughness?: string
  loyalty?: string
  defense?: string
  card_faces?: ScryfallCardFace[]
  legalities: ScryfallLegalities
  reserved: boolean
  foil: boolean
  nonfoil: boolean
  finishes: string[]
  oversized: boolean
  promo: boolean
  reprint: boolean
  variation: boolean
  set_id: string
  set: string
  set_name: string
  set_type: string
  set_uri: string
  set_search_uri: string
  scryfall_set_uri: string
  rulings_uri: string
  prints_search_uri: string
  collector_number: string
  digital: boolean
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus'
  flavor_name?: string
  card_back_id?: string
  artist?: string
  artist_ids?: string[]
  illustration_id?: string
  border_color: string
  frame: string
  security_stamp?: string
  full_art: boolean
  textless: boolean
  booster: boolean
  story_spotlight: boolean
  edhrec_rank?: number
  penny_rank?: number
  prices: ScryfallPrices
  related_uris?: Record<string, string>
  purchase_uris?: ScryfallPurchaseUris
}

export interface ScryfallList<T> {
  object: 'list'
  total_cards?: number
  has_more: boolean
  next_page?: string | null
  data: T[]
  warnings?: string[]
}

export interface ScryfallSet {
  object: 'set'
  id: string
  code: string
  mtgo_code?: string
  arena_code?: string
  tcgplayer_id?: number
  name: string
  set_type: string
  released_at?: string
  block_code?: string
  block?: string
  parent_set_code?: string
  card_count: number
  digital: boolean
  foil_only: boolean
  nonfoil_only: boolean
  scryfall_uri: string
  uri: string
  icon_svg_uri: string
  search_uri: string
}

export interface ScryfallRuling {
  object: 'ruling'
  oracle_id: string
  source: 'scryfall' | 'wotc'
  published_at: string
  comment: string
}

export interface ScryfallCatalog {
  object: 'catalog'
  uri: string
  total_values: number
  data: string[]
}

export interface ScryfallError {
  object: 'error'
  status: number
  code: string
  details: string
  type?: string
  warnings?: string[]
}

export type SortOrder =
  | 'name'
  | 'set'
  | 'released'
  | 'rarity'
  | 'color'
  | 'usd'
  | 'tix'
  | 'eur'
  | 'cmc'
  | 'power'
  | 'toughness'
  | 'edhrec'
  | 'penny'

export type SortDirection = 'auto' | 'asc' | 'desc'

export interface CardSearchOptions {
  q: string
  page?: number
  order?: SortOrder
  dir?: SortDirection
  unique?: 'cards' | 'art' | 'prints'
  include_extras?: boolean
  include_multilingual?: boolean
  include_variations?: boolean
}
