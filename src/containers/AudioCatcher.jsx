import React, { Component } from 'react';
import { connect } from 'react-redux';
import AudioCatcher from '../components/AudioCatcher';
import { captureAudio } from '../actions';

class AudioCatcherContainer extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this.beginSpeechDetection();
  }

  beginSpeechDetection() {
    const { dispatch } = this.props;

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new window.SpeechRecognition();
    recognition.interimResults = true;

    recognition.addEventListener('result', e => {
      console.log(e);

      const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)

      console.log(transcript);

      if (e.results[0].isFinal) {
        dispatch(captureAudio(transcript.join(' ')));
      }
    });

    recognition.addEventListener('end', function() {
      recognition.start();
    });

    recognition.start();
  }

  render() {
    return <AudioCatcher {...this.props}/>
  }
}

const mapStateToProps = (state) => {
  return {
    audio: state.audio,
  }
}

export default connect(mapStateToProps)(AudioCatcherContainer);