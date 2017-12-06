import { MENU_TIME, MENU_TYPE, WHEEL, SET_WHEEL, TOGGLE_MENU } from '../actions';
import { menuOptions } from '../constants';

const menu = (state = {
  type: menuOptions.type[0],
  time: menuOptions.time[0],
  wheel: 0,
  collapsed: false,
}, action) => {
  switch (action.type) {
    case TOGGLE_MENU:
      return {
        ...state,
        collapsed: !state.collapsed,
      }
    case MENU_TYPE: 
      return {
        ...state,
        type: action.payload,
      }
    case MENU_TIME: 
      return {
        ...state,
        time: action.payload,
      }
    case WHEEL: 
      let wheel = state.wheel + action.payload;
      if (wheel < 0) {
        wheel = 0;
      } else if (wheel > 1000) {
        wheel = 1000;
      }
      return {
        ...state,
        wheel,
      };
    case SET_WHEEL: 
      return {
        ...state,
        wheel: action.payload,
      };
    default:
      return state;
  }
}

export default menu;