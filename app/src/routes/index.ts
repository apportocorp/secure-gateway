import type { RouteRecordRaw } from 'vue-router'
import { useNProgress } from '@/lib/nprogress/nprogress'

import { useUserStore } from '@/pinia'
import {
  BellOutlined,
  FileTextOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'

import { createRouter, createWebHashHistory } from 'vue-router'
import 'nprogress/nprogress.css'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/layouts/BaseLayout.vue'),
    redirect: '/dashboard',
    meta: {
      name: () => $gettext('Home'),
    },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/DashBoard.vue'),
        name: 'Dashboard',
        meta: {
          name: () => $gettext('Dashboard'),
          icon: HomeOutlined,
        },
      },
      {
        path: 'config/add',
        name: 'Add Configuration',
        component: () => import('@/views/config/ConfigEditor.vue'),
        meta: {
          name: () => $gettext('Add Configuration'),
          hiddenInSidebar: true,
          lastRouteName: 'Manage Configs',
        },
      },
      {
        path: 'config/:name+/edit',
        name: 'Edit Configuration',
        component: () => import('@/views/config/ConfigEditor.vue'),
        meta: {
          name: () => $gettext('Edit Configuration'),
          hiddenInSidebar: true,
          lastRouteName: 'Manage Configs',
        },
      },
      {
        path: 'certificates',
        name: 'Certificates',
        component: () => import('@/layouts/BaseRouterView.vue'),
        redirect: '/certificates/list',
        meta: {
          name: () => $gettext('Certificates'),
          icon: SafetyCertificateOutlined,
        },
        children: [
          {
            path: 'acme_users',
            name: 'ACME User',
            component: () => import('@/views/certificate/ACMEUser.vue'),
            meta: {
              name: () => $gettext('ACME User'),
            },
          },
          {
            path: 'list',
            name: 'Certificates List',
            component: () => import('@/views/certificate/CertificateList/Certificate.vue'),
            meta: {
              name: () => $gettext('Certificates List'),
            },
          },
          {
            path: ':id',
            name: 'Modify Certificate',
            component: () => import('@/views/certificate/CertificateEditor.vue'),
            meta: {
              name: () => $gettext('Modify Certificate'),
              hiddenInSidebar: true,
              lastRouteName: 'Certificates List',
            },
          },
          {
            path: 'import',
            name: 'Import Certificate',
            component: () => import('@/views/certificate/CertificateEditor.vue'),
            meta: {
              name: () => $gettext('Import Certificate'),
              hiddenInSidebar: true,
              lastRouteName: 'Certificates List',
            },
          },
          {
            path: 'dns_credential',
            name: 'DNS Credentials',
            component: () => import('@/views/certificate/DNSCredential.vue'),
            meta: {
              name: () => $gettext('DNS Credentials'),
            },
          },
        ],
      },
      {
        path: 'nginx_log',
        name: 'Nginx Log',
        meta: {
          name: () => $gettext('Gateway Logs'),
          icon: FileTextOutlined,
        },
        children: [{
          path: 'access',
          name: 'Access Logs',
          component: () => import('@/views/nginx_log/NginxLog.vue'),
          meta: {
            name: () => $gettext('Access Logs'),
          },
        }, {
          path: 'error',
          name: 'Error Logs',
          component: () => import('@/views/nginx_log/NginxLog.vue'),
          meta: {
            name: () => $gettext('Error Logs'),
          },
        }, {
          path: 'site',
          name: 'Site Logs',
          component: () => import('@/views/nginx_log/NginxLog.vue'),
          meta: {
            name: () => $gettext('Site Logs'),
            hiddenInSidebar: true,
          },
        }],
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/notification/Notification.vue'),
        meta: {
          name: () => $gettext('Notifications'),
          icon: BellOutlined,
        },
      },
      {
        path: 'user',
        name: 'Manage Users',
        component: () => import('@/views/user/User.vue'),
        meta: {
          name: () => $gettext('Manage Users'),
          icon: UserOutlined,
        },
      },
      {
        path: 'preference',
        name: 'Preference',
        component: () => import('@/views/preference/Preference.vue'),
        meta: {
          name: () => $gettext('Preference'),
          icon: SettingOutlined,
        },
      },
    ],
  },
  {
    path: '/install',
    name: 'Install',
    component: () => import('@/views/other/Install.vue'),
    meta: { name: () => $gettext('Install'), noAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/other/Login.vue'),
    meta: { name: () => $gettext('Login'), noAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Not Found',
    component: () => import('@/views/other/Error.vue'),
    meta: { name: () => $gettext('Not Found'), noAuth: true, status_code: 404, error: () => $gettext('Not Found') },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const nprogress = useNProgress()

router.beforeEach((to, _, next) => {
  document.title = `${to?.meta.name?.() ?? ''} | Nginx UI`

  nprogress.start()

  const user = useUserStore()

  if (to.meta.noAuth || user.isLogin)
    next()
  else
    next({ path: '/login', query: { next: to.fullPath } })
})

router.afterEach(() => {
  nprogress.done()
})

export default router
