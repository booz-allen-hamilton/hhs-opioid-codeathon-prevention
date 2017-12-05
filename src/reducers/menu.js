import { MENU_A, MENU_B } from '../actions';

const menu = (state = {
  a: { value: 1, label: 'one' },
  b: { value: 'A', label: 'A' },
}, action) => {
  switch (action.type) {
    case MENU_A: 
      return {
        ...state,
        a: action.payload
      }
    case MENU_B: 
      return {
        ...state,
        b: action.payload
      }
    default:
      return state;
  }
}

export default menu;