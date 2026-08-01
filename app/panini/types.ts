export interface StickerSet {
  code: string;
  have: { [key: number]: number };
  order?: number;
  group?: string;
}

export interface StickerSetCounted {
  code: string;
  have: { [key: number]: number };
  order?: number;
  count: number;
}