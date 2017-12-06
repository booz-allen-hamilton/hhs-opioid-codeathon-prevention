import React from 'react';
import { format } from 'd3';

const Display = ({county, collapsed}) => {
  let className = 'display';
  if (collapsed) {
    className = 'display overlay';
  }
  return ((county && county.properties) && (
    <div className={className}>
      <div className="font-weight-bold">Name:</div>
      <div className="text-right">{county.properties.NAME}</div>
      <div className="font-weight-bold">Total Incidents:</div>
      <div className="text-right">{county.properties.totals.incidents}</div>
      <div className="font-weight-bold">Total Quantity:</div>
      <div className="text-right">{format('.3f')(county.properties.totals.grams)} grams</div>
    </div>
  )) || <div className={className} />  
};

export default Display;