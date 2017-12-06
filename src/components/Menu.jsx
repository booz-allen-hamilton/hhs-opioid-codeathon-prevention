import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { menuOptions } from '../constants';

class Menu extends Component {
  render() {
    const {
      menu,
      month,
      progressWidth,
      handleChangeType,
      handleChangeTime,
      handleProgressClick,
      toggleCollapse,
      progressRef,
    } = this.props;

    if (menu.collapsed) {
      return <button onClick={toggleCollapse}>➡</button>
    }

    return (
      <div className="menu">
        <button onClick={toggleCollapse} className="btn btn-outline-primary btn-block">
          Collapse ⬅
        </button>
        <div className="form-group">
          <label>
            type
          </label>
          <Select
            name="form-a"
            value={menu.type}
            onChange={handleChangeType}
            options={menuOptions.type}
          />
        </div>
        <div className="form-group">
          <label>
            time
          </label>
          <Select
            name="form-b"
            value={menu.time}
            onChange={handleChangeTime}
            options={menuOptions.time}
          />
        </div>
        <div className="form-group">
          <label>
            month
          </label>
          <div className="text-right">
            {month}
          </div>
        </div>
        <div ref={progressRef} className="progress-clicker" onClick={handleProgressClick}>
          <div className="progress-bar" style={{width: progressWidth}} />
        </div>
      </div>
    );
  }
}

export default Menu;