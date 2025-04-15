export const MORSE = '0xe591293151fFDadD5E06487087D9b0E2743de92E';
export const MORSE_MIRROR = '0x027DA47D6a5692c9b5cB64301A07d978cE3cB16c';

export const TransferEventABI = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'from', type: 'address' },
    { indexed: true, internalType: 'address', name: 'to', type: 'address' },
    { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
  ],
  name: 'Transfer',
  type: 'event',
} as const;

export const safeTransferFromABI = {
  inputs: [
    { internalType: 'address', name: 'from', type: 'address' },
    { internalType: 'address', name: 'to', type: 'address' },
    { internalType: 'uint256', name: 'id', type: 'uint256' },
  ],
  name: 'safeTransferFrom',
  outputs: [],
  stateMutability: 'payable',
  type: 'function',
} as const;
export const safeTransferFromWithDataABI = {
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
} as const;
