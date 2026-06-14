export const PACK_TOKEN_ID = "1";
export const VIP_PASS_TOKEN_ID = "2";

// NOTE: standardized on the plural ALIENS name to match the deployed Vercel env
// vars and the webhook route. Previously lib/api.ts/constants read the singular
// NEXT_PUBLIC_ALIEN_CONTRACT_ADDRESS, which was never set -> aliens never loaded.
export const SPECIALS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SPECIALS_CONTRACT_ADDRESS!;
export const ALIENS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ALIENS_CONTRACT_ADDRESS!;
