import React, { Component } from 'react';
import { connect } from 'react-redux';
import MapLeaflet from '../components/Map';
import { county } from '../actions';

class MapContainer extends Component {
  constructor() {
    super();

    this.handleCountyClick = this.handleCountyClick.bind(this);
  }

  handleCountyClick(d, i, nodes) {
    this.props.dispatch(county(d));
  }

  render() {
    const props = {
      ...this.props,
      handleCountyClick: this.handleCountyClick
    }
    return <MapLeaflet {...props} />
  }
}

const mapStateToProps = (state) => ({
  menu: state.menu,
  currentTime: '2015-01',
});

export default connect(mapStateToProps)(MapContainer);