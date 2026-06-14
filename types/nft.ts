export interface NFTAttribute {
  trait_type: string;
  // webhook-generated aliens use string (Rarity), number (Power/Fortune) and
  // boolean (Interdimensional) values.
  value: string | number | boolean;
}

export interface NFT {
  token_id: string;
  name: string;
  image: string;
  description: string;
  balance: string;
  collection: "pack" | "alien";
  contractAddress: string;
  attributes?: NFTAttribute[];
}
