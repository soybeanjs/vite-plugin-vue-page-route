const home1: AuthRoute.Route = {
  name: 'home1',
  path: '/home1',
  component: 'basic',
  meta: { title: 'home1', icon: 'mdi:menu' },
  children: [
    {
      name: 'home1_multi',
      path: '/home1/multi',
      component: 'multi',
      meta: { title: 'home1_multi', icon: 'mdi:menu' },
      children: [
        {
          name: 'home1_multi_third',
          path: '/home1/multi/third',
          component: 'multi',
          meta: { title: 'home1_multi_third', icon: 'mdi:menu' },
          children: [
            {
              name: 'home1_multi_third_third-child2',
              path: '/home1/multi/third/third-child2',
              component: 'self',
              meta: { title: 'home1_multi_third_third-child2', icon: 'mdi:menu' }
            },
            {
              name: 'home1_multi_third_third-child1',
              path: '/home1/multi/third/third-child1',
              component: 'self',
              meta: { title: 'home1_multi_third_third-child1', icon: 'mdi:menu' }
            }
          ]
        },
        {
          name: 'home1_multi_second',
          path: '/home1/multi/second',
          component: 'self',
          meta: { title: 'home1_multi_second', icon: 'mdi:menu' }
        },
        {
          name: 'home1_multi_first',
          path: '/home1/multi/first',
          component: 'self',
          meta: { title: 'home1_multi_first', icon: 'mdi:menu' }
        }
      ]
    }
  ]
};

export default home1;
