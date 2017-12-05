import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const Menu = ({menu, handleChangeA, handleChangeB}) => (
  <div className="menu">
    <div className="form-group">
      <label>
        A
      </label>
      <Select
        name="form-a"
        value={menu.a}
        onChange={handleChangeA}
        options={[
          { value: 1, label: 'one' },
          { value: 2, label: 'two' },
          { value: 3, label: 'three' },
        ]}
      />
    </div>
    <div className="form-group">
      <label>
        B
      </label>
      <Select
        name="form-b"
        value={menu.b}
        onChange={handleChangeB}
        options={[
          { value: 'A', label: 'A' },
          { value: 'B', label: 'B' },
          { value: 'C', label: 'C' },
        ]}
      />
    </div>
  </div>
);

export default Menu;