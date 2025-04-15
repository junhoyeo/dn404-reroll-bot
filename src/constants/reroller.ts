// https://raw.githubusercontent.com/KeystoneHQ/Smart-Contract-Metadata-Registry/365010fea9dd09feb6721f1eb9c8e17fd979db54/ethereum/0x0e1fa5a3507e8afb6a040c4edc61de60a7f7474f.json
export const REROLLER = {
  name: 'Reroller',
  chainId: 1,
  address: '0x0e1FA5A3507E8aFb6A040C4eDc61DE60A7F7474F',
  metadata: {
    output: {
      abi: [
        {
          inputs: [
            {
              internalType: 'contract IMorseReroller',
              name: 'morse_',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
          name: 'SafeERC20FailedOperation',
          type: 'error',
        },
        {
          inputs: [],
          name: 'morse',
          outputs: [
            {
              internalType: 'contract IMorseReroller',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          ],
          name: 'ownerOf',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
          ],
          name: 'reroll',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
    },
  },
  version: 1,
  checkPoints: [],
  isProxy: false,
  principalAddress: null,
} as const;
