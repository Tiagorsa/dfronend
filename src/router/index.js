import Vue from 'vue'
import VueRouter from 'vue-router'
import { Notify } from 'quasar'

import routes from './routes'

// Ajuste para desativar error por navegação duplicada
// https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
// const originalPush = VueRouter.prototype.push
// VueRouter.prototype.push = function push (location, onResolve, onReject) {
//   if (onResolve || onReject) { return originalPush.call(this, location, onResolve, onReject) }
//   return originalPush.call(this, location).catch((err) => {
//     if (VueRouter.isNavigationFailure(err)) {
//       // resolve err
//       return err
//     }
//     // rethrow error
//     return Promise.reject(err)
//   })
// }

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const Router = new VueRouter({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes,
  // Leave these as they are and change in quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  // quasar.conf.js -> build -> publicPath
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE
})

const whiteListName = [
  'login',
  'reset',
  'signup'
]

Router.beforeEach((to, from, next) => {
  const token = JSON.parse(localStorage.getItem('token'));
  const userProfile = localStorage.getItem('profile');
  const menuVisibility = JSON.parse(localStorage.getItem('menuVisibility') || '{}');
  const blockedRoutes = Object.keys(menuVisibility).filter(key => menuVisibility[key] === false);

  const whiteListName = ['login', 'reset', 'signup'];

  if (window.ctrlClickNavigation) {
    window.ctrlClickNavigation = false;
    window.open(Router.resolve(to).href, '_blank');
    return;
  }

  if (!token) {
    if (!whiteListName.includes(to.name)) {
      if (to.fullPath !== '/login' && !to.query.tokenSetup) {
        Notify.create({ message: 'Necessário realizar login', position: 'top' });
        return next({ name: 'login' });
      }
    }
    return next();
  }

  if (userProfile !== 'superadmin') {
    for (const route of blockedRoutes) {
      if (to.path.startsWith(`/${route}`)) {
        Notify.create({ message: 'Acesso negado', color: 'negative', position: 'top' });
        return next({ name: 'contatos' });
      }
    }

    if (menuVisibility[to.name] === false) {
      Notify.create({ message: 'Acesso negado', color: 'negative', position: 'top' });
      return next({ name: 'contatos' });
    }
  }

  return next();
});


// Router.beforeEach((to, from, next) => {
//   const token = JSON.parse(localStorage.getItem('token'))
//   const userProfile = localStorage.getItem('profile');
//   const menuVisibility = JSON.parse(localStorage.getItem('menuVisibility') || '{}');
//   const blockedRoutes = Object.keys(menuVisibility).filter(key => menuVisibility[key] === false);

//   for (const route of blockedRoutes) {
//     if (to.path.startsWith(`/${route}`)) {
//       Notify.create({ message: 'Acess denied', color: 'negative', position: 'top' });
//       return next({ name: 'contatos' });
//     }
//   }

//   if (window.ctrlClickNavigation) {
//     window.ctrlClickNavigation = false;
//     window.open(Router.resolve(to).href, '_blank');
//     return;
//   }

//   if (!token) {
//     if (whiteListName.indexOf(to.name) == -1) {
//       if (to.fullPath !== '/login' && !to.query.tokenSetup) {
//         Notify.create({ message: 'Necessário realizar login', position: 'top' })
//         next({ name: 'login' })
//       } else {
//         next()
//       }
//     } else {
//       next()
//     }
//   }
//   if (userProfile !== 'superadmin') {
//     if (menuVisibility[to.name] === false) {
//       Notify.create({ message: 'Acess denied', color: 'negative', position: 'top' });
//       return next({ name: 'contatos' });
//     } else {
//       next()
//     }
//   }
//   else {
//     next()
//   }
// })

Router.afterEach(to => {
  window.scrollTo(0, 0)
})

export default Router
