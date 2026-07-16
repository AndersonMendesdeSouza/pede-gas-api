export class AddressesResponseDto {
  id: string;
  default: boolean;
  name: string;
  street: string;
  number: string;
  lot?: string;
  block?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
