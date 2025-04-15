import ky from 'ky';
import terminalImage from 'terminal-image';
import { erc721Abi } from 'viem';

import { publicClient } from './constants/chain';
import { MORSE } from './constants/morse';

const displayImageFromURL = async (url: string) => {
  const response = await ky.get(url);
  const imageBuffer = await response.arrayBuffer();
  const image = await terminalImage.buffer(new Uint8Array(imageBuffer));
  console.log(image);
};

const resolveIPFS = (uri: string) => {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return uri;
};

const getMorseImage = async (tokenId: number) => {
  const metadataURI = await publicClient.readContract({
    address: MORSE,
    abi: erc721Abi,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });
  const response = await ky.get(resolveIPFS(metadataURI));
  const metadata = await response.json<{ image_url: string }>();
  return resolveIPFS(metadata.image_url);
};

const main = async () => {
  displayImageFromURL(await getMorseImage(1));
};

main();
