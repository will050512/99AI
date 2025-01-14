import type { Menu } from '#/global'

const menus: Menu.recordRaw = {
  meta: {
    title: '多級導航',
    icon: 'heroicons-solid:menu-alt-3',
  },
  children: [
    {
      path: '/multilevel_menu_example/page',
      meta: {
        title: '導航1',
      },
    },
    {
      meta: {
        title: '導航2',
      },
      children: [
        {
          path: '/multilevel_menu_example/level2/page',
          meta: {
            title: '導航2-1',
          },
        },
        {
          meta: {
            title: '導航2-2',
          },
          children: [
            {
              path: '/multilevel_menu_example/level2/level3/page1',
              meta: {
                title: '導航2-2-1',
              },
            },
            {
              path: '/multilevel_menu_example/level2/level3/page2',
              meta: {
                title: '導航2-2-2',
              },
            },
          ],
        },
      ],
    },
  ],
}

export default menus
