import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleMenu, investigate } from '../actions';
import Display from '../components/Display';

class DisplayContainer extends Component {
  constructor() {
    super();

    this.handleInvestigate = this.handleInvestigate.bind(this);
  }

  handleInvestigate() {
    if (!this.props.collapsed) {
      this.props.dispatch(toggleMenu());
    }
    window.setTimeout(() => {
      this.props.dispatch(investigate());
    }, 1);
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