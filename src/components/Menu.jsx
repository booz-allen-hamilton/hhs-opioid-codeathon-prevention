import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export default class Menu extends Component {
  constructor() {
    super();

    this.state = {
      a: 1,
      b: 'A',
    };

    this.handleChangeA = this.handleChangeA.bind(this);
    this.handleChangeB = this.handleChangeB.bind(this);
  }

  componentWillReceiveProps(newProps) {
  }

  handleChangeA(selectedOption) {
    console.log('change A', selectedOption);
    this.setState({
      a: selectedOption.value,
    });
  }

  handleChangeB(selectedOption) {
    console.log('change B', selectedOption);
    this.setState({
      b: selectedOption.value,
    });
  }

  render() {
    return (
      <div className="menu">
        <div className="form-group">
          <label>
            A
          </label>
          <Select 
            name="form-a"
            value={this.state.a}
            onChange={this.handleChangeA}
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
            value={this.state.b}
            onChange={this.handleChangeB}
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
            ]}
          />
        </div>  
      </div>  
    );
  }
}