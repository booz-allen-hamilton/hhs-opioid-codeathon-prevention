import { MENU_TIME, MENU_TYPE } from '../actions';
import { menuOptions } from '../constants';

const menu = (state = {
  type: menuOptions.type[0],
  time: menuOptions.time[0],
}, action) => {
  switch (action.type) {
    case MENU_TYPE: 
      return {
        ...state,
        type: action.payload
      }
    case MENU_TIME: 
      return {
        ...state,
        time: action.payload
      }
    default:
      return state;
  }
}

export default menu;