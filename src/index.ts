import * as dotenv from 'dotenv';
import {
  Account,
  Address,
  Chain,
  Transport,
  WalletClient,
  createWalletClient,
  decodeEventLog,
  erc20Abi,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { mainnet, publicClient } from './constants/chain';
import { MORSE, TransferEventABI } from './constants/morse';
import { REROLLER } from './constants/reroller';

dotenv.config();

const ALLOWED = [6991n];

const isSameAddress = (a: Address, b: Address) => {
  return a.toLowerCase() === b.toLowerCase();
};

const approveMorse = async (
  walletClient: WalletClient<Transport, Chain, Account>,
) => {
  console.log('Approving');
  const hash = await walletClient.writeContract({
    address: MORSE,
    abi: erc20Abi,
    functionName: 'approve',
    args: [REROLLER.address, parseEther('10')],
  });
  console.log(hash);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('Approved');
};

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
  await approveMorse(walletClient);

  let i = 0;
  while (true) {
    const hash = await walletClient.writeContract({
      address: REROLLER.address,
      abi: REROLLER.metadata.output.abi,
      functionName: 'reroll',
      args: [13544561693449094n],
    });
    console.log(hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const tokenID =
      receipt.logs.flatMap((log) => {
        try {
          const event = decodeEventLog({
            abi: [TransferEventABI],
            data: log.data,
            topics: log.topics,
          });
          if (!event) {
            return [];
          }
          // address -> null 이니까 이건 새로 받은 게 아님
          if (isSameAddress(event.args.from, account.address)) {
            return [];
          }
          console.log([event.args.from, event.args.to, event.args.id]);
          return event.args.id;
        } catch (error) {
          return [];
        }
      })?.[0] || null;
    console.log([tokenID]);

    if (tokenID !== null && ALLOWED.includes(tokenID)) {
      console.log('Allowed');
      break;
    } else {
      console.log('Still rolling');
    }

    i++;
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
