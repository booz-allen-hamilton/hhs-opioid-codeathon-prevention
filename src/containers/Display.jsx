import React, { Component } from 'react';
import { connect } from 'react-redux';
import { investigate } from '../actions';
import Display from '../components/Display';

class DisplayContainer extends Component {
  constructor() {
    super();

    this.handleInvestigate = this.handleInvestigate.bind(this);
  }

  handleInvestigate() {
    this.props.dispatch(investigate())
  }

  render() {
    const props = {
      ...this.props,
      handleInvestigate: this.handleInvestigate,
    };
    return <Display {...props}/>;
  }
}

const mapStateToProps = (state) => ({
  collapsed: state.menu.collapsed,
  county: state.county,
  investigate: state.investigate,
});

export default connect(mapStateToProps)(DisplayContainer);