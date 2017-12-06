import { INVESTIGATE } from '../actions';

const investigate = (state = false, action) => {
  switch (action.type) {
    case INVESTIGATE: 
      return !state;
    default:
      return state;
  }
}

export default investigate;