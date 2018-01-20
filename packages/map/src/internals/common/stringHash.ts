/**
 * Generator of 32 bit hashes of given string
 */
export function stringHash (str: string): number {
  let hash = 0;

  for(let i = 0; i < str.length; ++i) {
    hash = (((hash << 5) - hash) + str.charCodeAt(i)) | 0;
  }

  return hash;
}
