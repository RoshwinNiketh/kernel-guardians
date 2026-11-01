export interface Asset { file: string; width: number; height: number; transparent: boolean; role: string; anchor?: string; origin?: string }
export interface AssetManifest { version: string; project: string; artboard: { width: number; height: number }; assets: Record<string, Asset>; limitations: string[] }
