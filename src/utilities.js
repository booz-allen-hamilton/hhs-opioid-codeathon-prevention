import * as d3 from 'd3';

export const calcMonth = (wheel) => {
  const month = Math.floor(wheel / (1001 / 12) ) + 1;

  let string = month + '';
  if (string.length === 1) {
    string = `0${string}`;
  }

  return `2015-${string}`;
}

export const concatCode = ({ properties }) => `${properties.STATEFP}${properties.COUNTYFP}`;

export const radiusScale = (flow) => Math.sqrt(flow) / 3 + 2;

export const MAX_FLOW_VALUE = 2500;
export const colorScale = (flow) => d3.interpolateCool(flow / MAX_FLOW_VALUE);

