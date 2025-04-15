import * as dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { mainnet } from './constants/chain';
import { REROLLER } from './constants/reroller';

dotenv.config();

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const COUNT = 20;

const main = async () => {
  let pk = process.env.PRIVATE_KEY;
  if (pk?.startsWith('0x')) {
    pk = pk.slice(2);
  }
  if (!pk) {
    throw new Error('PRIVATE_KEY is not set');
  }
  const account = privateKeyToAccount(`0x${pk}`);

  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport: http(),
  });

  console.log(account.address);

  const nonce = await publicClient.getTransactionCount({
    address: account.address,
  });

  for (let i = 0; i < COUNT; i++) {
    try {
      await walletClient.writeContract({
        address: REROLLER.address,
        abi: REROLLER.metadata.output.abi,
        functionName: 'reroll',
        args: [13544561693449095n],
        nonce: nonce + i,
      });

      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    } catch (err) {
      console.log(err);
    }
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
