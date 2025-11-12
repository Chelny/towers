export const convertImageToBase64 = async (file: File): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Promise((resolve: (value: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
    const reader: FileReader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
