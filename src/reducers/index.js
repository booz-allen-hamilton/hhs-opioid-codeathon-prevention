import { combineReducers } from 'redux';
import menu from './menu';
import county from './county';

const rootReducer = combineReducers({
  menu,
  county
})

export default rootReducer