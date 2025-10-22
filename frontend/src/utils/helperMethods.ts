export const file2Base64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

// half-up rounding
export function roundHalfUp(num: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}
