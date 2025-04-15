import * as dotenv from 'dotenv';
import {
  Account,
  Address,
  Chain,
  TransactionReceipt,
  Transport,
  WalletClient,
  createWalletClient,
  decodeEventLog,
  encodePacked,
  erc20Abi,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { mainnet, publicClient } from './constants/chain';
import {
  MORSE,
  MORSE_MIRROR,
  TransferEventABI,
  safeTransferFromABI,
  safeTransferFromWithDataABI,
} from './constants/morse';
import { REROLLER_V3_1 } from './constants/reroller';
import { displayImageFromURL } from './image';
import { getMorseImage } from './image';

dotenv.config();

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
    args: [REROLLER_V3_1.address, parseEther('1')],
  });
  console.log(hash);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('Approved');
};

export const getMintedTokenIDFromReceipt = (
  receipt: TransactionReceipt,
  account: Account,
) => {
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
        if (isSameAddress(event.args.to, account.address)) {
          console.log([event.args.from, event.args.to, event.args.id]);
          return event.args.id;
        }
        return [];
      } catch (error) {
        return [];
      }
    })?.[0] || null;
  console.log([tokenID]);
  return tokenID;
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

  const initialTokenID = 7269n;
  const targetTokenID = 7395n;

  let currentTokenID = initialTokenID;

  while (currentTokenID !== targetTokenID) {
    let mintedTokenID = 0n;
    {
      const hash = await walletClient.writeContract({
        address: MORSE_MIRROR,
        abi: [safeTransferFromABI],
        functionName: 'safeTransferFrom',
        args: [account.address, REROLLER_V3_1.address, currentTokenID],
      });
      console.log(hash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      mintedTokenID = BigInt(
        getMintedTokenIDFromReceipt(receipt, account) || 0,
      );
    }
    if (mintedTokenID === targetTokenID) {
      currentTokenID = mintedTokenID;
      console.log('Target token ID reached!');
      break;
    }

    let limitTokenID = mintedTokenID + 100n;
    if (limitTokenID > targetTokenID) {
      limitTokenID = targetTokenID;
    }
    const hash = await walletClient.writeContract({
      address: MORSE_MIRROR,
      abi: [safeTransferFromWithDataABI],
      functionName: 'safeTransferFrom',
      args: [
        account.address,
        REROLLER_V3_1.address,
        mintedTokenID,
        encodePacked(['uint256'], [limitTokenID]),
      ],
    });
    console.log(hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const tokenID = getMintedTokenIDFromReceipt(receipt, account);
    console.log('Rerolled!', [tokenID]);
    currentTokenID = BigInt(tokenID || 0);

    await displayImageFromURL(await getMorseImage(Number(currentTokenID)));
  }

  console.log('Done!', { currentTokenID });
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
