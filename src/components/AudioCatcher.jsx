import React, { Component } from 'react';

export default class AudioCatcherContainer extends Component {
  componentWillReceiveProps(newProps) {
    console.log(newProps);
  }

  render() {
    return (
      <div>
        <h2>Text from Speech:</h2>
        <ul>
          {this.props.audio.text.map((text, index) => <li key={`${text}-${index}`}>{text}</li>)}
        </ul>
      </div>
    );
  }
}