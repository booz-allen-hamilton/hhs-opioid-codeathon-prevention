import React, { Component } from 'react';
import Menu from './Menu';
import MapLeaflet from './Map';

export default class Dashboard extends Component {
  componentWillReceiveProps(newProps) {
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-12 header">
            <h1>Dashboard</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-lg-2">
            <Menu />
          </div>
          <div className="col-12 col-lg-10">
            <MapLeaflet counties={ this.props.counties } />
          </div>
        </div>
      </div>  
    );
  }
}