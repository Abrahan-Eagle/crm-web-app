export const safeFloatSum = (numbers: any[], positions: number): number => {
  const factor = Math.pow(10, positions);
  return numbers.map((num) => num.toFixed(positions) * factor).reduce((acc, num) => acc + num, 0) / factor;
};
