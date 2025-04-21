import { client } from "@/lib/client"; // only one client for now

export async function mintToken({
  tokenId,
  walletAddress,
}: {
  tokenId: string;
  walletAddress: string;
}) {
  const reference_id = `mint-${tokenId}-${Date.now()}`;

  const contractAddress = process.env.NEXT_PUBLIC_SPECIALS_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Missing contract address");
  }

  return await client.createMintRequest({
    chainName: "imtbl-zkevm-testnet",
    contractAddress,
    createMintRequestRequest: {
      assets: [
        {
          reference_id,
          owner_address: walletAddress,
          token_id: tokenId,
          amount: "1",
        },
      ],
    },
  });
}
