export const convertColorListToHex = (colorList: number[]): string => {
  if (!colorList) return "";
  if (colorList.length !== 3) return "";

  return "#".concat(
    colorList
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
};
