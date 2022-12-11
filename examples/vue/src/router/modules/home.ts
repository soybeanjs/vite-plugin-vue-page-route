const home: AuthRoute.Route = {
  name: 'home',
  path: '/home',
  component: 'basic',
  meta: { title: 'home', icon: 'mdi:menu' },
  children: [
    { name: 'home_third', path: '/home/third', component: 'self', meta: { title: 'home_third', icon: 'mdi:menu' } }
  ]
};

export default home;
