import React, { Component } from 'react';
import './App.css';
import AudioCatcher from '../containers/AudioCatcher';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Hawkins Lab</h1>
        </header>
        <AudioCatcher />
      </div>
    );
  }
}

export default App;
