import { CAPTURE } from '../actions';

const audio = (state = {
  text: [],
}, action) => {
  switch (action.type) {
    case CAPTURE: 
      return {
        ...state,
        text: [...state.text, action.payload]
      }
    default:
      return state;
  }
}

export default audio;