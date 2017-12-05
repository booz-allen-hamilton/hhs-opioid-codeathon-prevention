import React, { Component } from 'react';
import { connect } from 'react-redux';
import Menu from '../components/Menu';
import { menuTime, menuType } from '../actions';

class MenuContainer extends Component {
  constructor() {
    super();

    this.handleChangeType = this.handleChangeType.bind(this);
    this.handleChangeTime = this.handleChangeTime.bind(this);
  }

  handleChangeTime(selected) {
    this.props.dispatch(menuTime(selected));
  }

  handleChangeType(selected) {
    this.props.dispatch(menuType(selected));
  }

  render() {
    const props = {
      ...this.props,
      handleChangeTime: this.handleChangeTime,
      handleChangeType: this.handleChangeType,
    }
    return <Menu {...props}/>
  }
}

const mapStateToProps = (state) => ({
  menu: state.menu,
});

export default connect(mapStateToProps)(MenuContainer);