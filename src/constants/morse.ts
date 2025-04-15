export const MORSE = '0xe591293151fFDadD5E06487087D9b0E2743de92E';

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
