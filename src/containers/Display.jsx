import React, { Component } from 'react';
import { connect } from 'react-redux';
import Display from '../components/Display';

class DisplayContainer extends Component {
  render() {
    const props = {
      ...this.props,
    };
    return <Display {...props}/>;
  }
}

const mapStateToProps = (state) => ({
  collapsed: state.menu.collapsed,
  county: state.county,
});

export default connect(mapStateToProps)(DisplayContainer);