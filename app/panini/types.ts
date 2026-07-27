export interface StickerSet {
  code: string;
  have: { [key: number]: number };
  order?: number;
  group?: string;
}