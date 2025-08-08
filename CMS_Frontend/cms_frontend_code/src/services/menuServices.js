import axios from '../lib/axios';

export const getMenus = () =>
  axios.get('/get_menus');      
