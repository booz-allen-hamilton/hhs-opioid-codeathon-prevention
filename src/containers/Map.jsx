import React, { Component } from 'react';
import { connect } from 'react-redux';
import MapLeaflet from '../components/Map';

class MapContainer extends Component {
  render() {
    return <MapLeaflet { ...this.props } />
  }
}

const mapStateToProps = (state) => ({
  menu: state.menu,
});

export default connect(mapStateToProps)(MapContainer);