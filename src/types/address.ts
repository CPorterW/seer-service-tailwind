export interface Address {
  id: number;
  name: string;
  street: string;
  zipCode: string;
  lastUsed: string | null;
  isVendor: boolean;
  totalTaxRate: number;
  createdDateTime: string;
}