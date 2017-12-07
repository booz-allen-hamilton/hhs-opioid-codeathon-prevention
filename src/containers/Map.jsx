import React, { Component } from 'react';
import { connect } from 'react-redux';
import { county } from '../actions';
import { calcMonth } from '../utilities';
import MapLeaflet from '../components/Map';

class MapContainer extends Component {
  constructor() {
    super();
    this.state = {
      supply: null
    };

    this.handleCountyClick = this.handleCountyClick.bind(this);
  }

  componentDidMount() {
    fetch('supply.json')
      .then(blob => blob.json())
      .then(data => {
        this.setState({
          supply: data,
        });
      });
  }

  handleCountyClick(d, i, nodes) {
    this.props.dispatch(county(d));
  }

  render() {
    const props = {
      ...this.props,
      supply: this.state.supply,
      handleCountyClick: this.handleCountyClick,
    }
    return <MapLeaflet {...props} />
  }
}

const mapStateToProps = (state) => ({
  menu: state.menu,
  currentTime: calcMonth(state.menu.wheel),
  investigate: state.investigate,
  county: state.county,
});

export default connect(mapStateToProps)(MapContainer);