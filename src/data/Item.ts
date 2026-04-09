// Item interface placeholder
// Will define item types for US-014

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'weapon' | 'armor' | 'accessory' | 'key';
  description: string;
  price: number;
}