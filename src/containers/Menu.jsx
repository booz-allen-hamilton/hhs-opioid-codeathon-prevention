import React, { Component } from 'react';
import { connect } from 'react-redux';
import Menu from '../components/Menu';
import { menuTime, menuType, wheel, setWheel, toggleMenu } from '../actions';
import { calcMonth } from '../utilities';

class MenuContainer extends Component {
  constructor() {
    super();

    this.handleChangeType = this.handleChangeType.bind(this);
    this.handleChangeTime = this.handleChangeTime.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleProgressClick = this.handleProgressClick.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);

    this.setUpScroll()
  }

  componentWillUnmount() {
    document.removeEventListener('wheel', this.handleScroll);
  }

  toggleCollapse() {
    this.props.dispatch(toggleMenu());
  }

  setUpScroll() {
    document.addEventListener('wheel', this.handleScroll)
  }

  handleScroll(e) {
    e.preventDefault();
    this.props.dispatch(wheel(e.deltaY));
  }

  handleProgressClick(e) {
    this.props.dispatch(setWheel(1000 * (e.clientX - this.progressElement.offsetLeft - 1) / this.progressElement.clientWidth));
  }

  handleChangeTime(selected) {
    this.props.dispatch(menuTime(selected));
  }

  handleChangeType(selected) {
    this.props.dispatch(menuType(selected));
  }

  calcWidth(wheel) {
    return `${wheel/10}%`;
  }

  render() {
    const props = {
      ...this.props,
      month: calcMonth(this.props.menu.wheel),
      progressWidth: this.calcWidth(this.props.menu.wheel),
      handleChangeTime: this.handleChangeTime,
      handleChangeType: this.handleChangeType,
      handleProgressClick: this.handleProgressClick,
      toggleCollapse: this.toggleCollapse,
      progressRef: el => this.progressElement = el,
    }
    return <Menu {...props}/>
  }
}

const mapStateToProps = (state) => ({
  menu: state.menu,
});

export default connect(mapStateToProps)(MenuContainer);