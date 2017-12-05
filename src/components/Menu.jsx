import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { menuOptions } from '../constants';

const Menu = ({menu, handleChangeType, handleChangeTime}) => (
  <div className="menu">
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
  </div>
);

export default Menu;