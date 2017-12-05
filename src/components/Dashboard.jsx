import React, { Component } from 'react';
import Menu from '../containers/Menu';
import MapLeaflet from '../containers/Map';

export default class Dashboard extends Component {
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 header">
            <h1>Hawkins Laboratory</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-lg-2">
            <Menu />
          </div>
          <div className="col-12 col-lg-10">
            <MapLeaflet />
          </div>
        </div>
      </div>  
    );
  }
}