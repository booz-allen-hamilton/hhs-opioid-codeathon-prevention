import React from 'react';
import * as d3 from 'd3';

const Display = ({county}) => (
  ((county && county.properties) && (
    <div className="display">
      <div className="font-weight-bold">Name:</div>
      <div className="text-right">{county.properties.NAME}</div>
      <div className="font-weight-bold">Incidents:</div>
      <div className="text-right">{county.properties.totals.incidents}</div>
      <div className="font-weight-bold">Quantity:</div>
      <div className="text-right">{d3.format('.3f')(county.properties.totals.grams)} grams</div>
    </div>
  )) || <div className="display" />  
);

export default Display;