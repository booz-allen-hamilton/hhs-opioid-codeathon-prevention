import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';

class DashboardContainer extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
  }

  render() {
    return <Dashboard
      {...this.props}
    />
  }
}

const mapStateToProps = (state) => {
  return {};
}

export default connect(mapStateToProps)(DashboardContainer);