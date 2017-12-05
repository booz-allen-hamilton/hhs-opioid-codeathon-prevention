import React, { Component } from 'react';
import { connect } from 'react-redux';
import Menu from '../components/Menu';
import { menuA, menuB } from '../actions';

class MenuContainer extends Component {
  constructor() {
    super();

    this.handleChangeA = this.handleChangeA.bind(this);
    this.handleChangeB = this.handleChangeB.bind(this);
  }

  handleChangeA(selected) {
    this.props.dispatch(menuA(selected));
  }

  handleChangeB(selected) {
    this.props.dispatch(menuB(selected));
  }

  render() {
    const props = {
      ...this.props,
      handleChangeA: this.handleChangeA,
      handleChangeB: this.handleChangeB,
    }
    return <Menu {...props}/>
  }
}

const mapStateToProps = (state) => ({
  menu: state.menu,
});

export default connect(mapStateToProps)(MenuContainer);