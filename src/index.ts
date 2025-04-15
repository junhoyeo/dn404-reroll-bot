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
import { MORSE, TransferEventABI } from './constants/morse';
import { REROLLER_V3_1 } from './constants/reroller';

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

const MIRROR_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'id', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

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
    args: [REROLLER_V3_1.address, parseEther('1')],
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

  const initialTokenID = 7067n;

  let mintedTokenID = 0n;
  {
    const hash = await walletClient.writeContract({
      address: '0x027DA47D6a5692c9b5cB64301A07d978cE3cB16c', // mirror
      abi: [
        {
          inputs: [
            { internalType: 'address', name: 'from', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'id', type: 'uint256' },
          ],
          name: 'safeTransferFrom',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
      ],
      functionName: 'safeTransferFrom',
      args: [account.address, REROLLER_V3_1.address, initialTokenID],
    });
    console.log(hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    mintedTokenID = BigInt(getMintedTokenIDFromReceipt(receipt, account) || 0);
  }

  const hash = await walletClient.writeContract({
    address: '0x027DA47D6a5692c9b5cB64301A07d978cE3cB16c', // mirror
    abi: [
      {
        inputs: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ],
    functionName: 'safeTransferFrom',
    args: [
      account.address,
      REROLLER_V3_1.address,
      mintedTokenID,
      encodePacked(['uint256'], [mintedTokenID + 100n]),
    ],
  });
  console.log(hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const tokenID = getMintedTokenIDFromReceipt(receipt, account);
  console.log([tokenID]);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
