export interface AddressMonthlySpend {
  id: number | null;
  addressId: number;
  name: string;
  street: string;
  zipCode: string;
  lastUsed: string | null;
  isVendor: boolean;
  totalTaxRate: number;
  moneySpent: number;
  month: number;
  year: number;
}
