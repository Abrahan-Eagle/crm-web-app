export const fileTypeFromURL = (url: string): string => {
  return new URL(url).pathname.split('.').at(-1) ?? '';
};
