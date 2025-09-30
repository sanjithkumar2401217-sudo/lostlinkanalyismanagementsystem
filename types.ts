export type ItemType = 'Lost' | 'Found';
export type ItemStatus = 'Pending' | 'Matched' | 'Claimed' | 'Returned';
export type Page = 'DASHBOARD' | 'ITEMS' | 'HANDOVER';

export interface OwnerDetails {
  registerNumber: string;
  year: number;
  dept: string;
}

export interface HandoverDetails {
  name: string;
  faculty: string;
  dept: string;
  cabinNo: string;
}

export interface ItemRecord {
  id: string;
  name: string;
  type: ItemType;
  category: string;
  description: string;
  location: string;
  date: string; // ISO 8601 format
  status: ItemStatus;
  itemPictureUrl: string;
  ownerDetails?: OwnerDetails;
  handoverDetails?: HandoverDetails;
  matchId?: string; // ID of the matched item
}