import React, { Component } from 'react';
import Menu from '../containers/Menu';
import Display from '../containers/Display';
import MapLeaflet from '../containers/Map';

export default class Dashboard extends Component {
  render() {
    let menuClass = 'col-12 col-lg-2';
    let mapClass = 'col-12 col-lg-10';
    if (this.props.menu.collapsed) {
      menuClass = 'collapsed';
      mapClass = 'expanded';
    }
    return (
      <div className="container-fluid">
        <div className="header">
          <span>The Hawkins Tool</span>
        </div>
        <div className="row">
          <div className={menuClass}>
            <Menu />
            <Display />
          </div>
          <div className={mapClass}>
            <MapLeaflet />
          </div>
        </div>
      </div>  
    );
  }
}