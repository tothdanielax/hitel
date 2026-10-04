export const inRange = ({ min, max }: { min: number; max: number }) => {
  return ({ value }: { value: number }): string | undefined => {
    return value < min || value > max ? `${min} és ${max} közötti érték` : undefined;
  };
};
