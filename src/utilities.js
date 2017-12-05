
export const calcMonth = (wheel) => {
  const month = Math.floor(wheel / (1001 / 12) ) + 1;

  let string = month + '';
  if (string.length === 1) {
    string = `0${string}`;
  }

  return `2015-${string}`;
}
