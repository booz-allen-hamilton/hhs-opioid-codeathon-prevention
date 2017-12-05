import { COUNTY } from '../actions';

const county = (state = {}, action) => {
  switch (action.type) {
    case COUNTY: 
      return {
        ...state,
        ...action.payload
      }
    default:
      return state;
  }
}

export default county;