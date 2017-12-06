import { combineReducers } from 'redux';
import menu from './menu';
import county from './county';
import investigate from './investigate';

const rootReducer = combineReducers({
  menu,
  county,
  investigate
})

export default rootReducer