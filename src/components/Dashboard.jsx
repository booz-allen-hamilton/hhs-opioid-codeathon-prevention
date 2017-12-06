import React, { Component } from 'react';
import Menu from '../containers/Menu';
import Display from '../containers/Display';
import MapLeaflet from '../containers/Map';

export default class Dashboard extends Component {
  render() {
    let menuClass = 'col-12 col-lg-2 animate';
    let mapClass = 'col-12 col-lg-10 animate';
    if (this.props.menu.collapsed) {
      menuClass = 'collapsed animate';
      mapClass = 'expanded animate';
    }
    return (
      <div className="container-fluid">
        <div className="header">
          <h1>Hawkins Laboratory</h1>
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