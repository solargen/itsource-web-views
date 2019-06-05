import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
import routes from './routes'
import 'font-awesome/css/font-awesome.min.css'

import axios from 'axios'

axios.defaults.baseURL = "http://localhost:8080"
Vue.prototype.$http = axios;

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

const router = new VueRouter({
  routes
})

//处理页面刷新动态路由失效问题
initIndexRouters();
function initIndexRouters(){
    if(!sessionStorage.routers){
        return;
    }
    //防止重复配置路由
    if(router.options.routes.length>4){
        return;
    }
    let routers = JSON.parse(sessionStorage.routers);
    let tempRouters = [];
    routers.forEach(route=>{
        let indexRouter = {
            path: '/',
            name: route.name,
            component: resolve => require(['@/views/Home'], resolve),
            children: []
        }
        route.children.forEach(childRouter=>{
            let cr = {
                path: childRouter.path,
                name: childRouter.name,
                component: resolve => require(['@/views/' + childRouter.component], resolve)
            }
            indexRouter.children.push(cr)
        })
        tempRouters.push(indexRouter)
        router.options.routes.push(indexRouter)
    })
    //动态路由配置
    router.addRoutes(tempRouters);

}

router.beforeEach((to, from, next) => {
  //NProgress.start();
  if (to.path == '/login') {
    sessionStorage.removeItem('user');
  }
  let user = JSON.parse(sessionStorage.getItem('user'));
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})
//请求拦截器，向请求头中添加token
axios.interceptors.request.use(config => {
    if (sessionStorage.getItem('token')) {
        // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
        config.headers['X-Token'] = sessionStorage.getItem('token')
    }
    return config
}, error => {
    // Do something with request error
    Promise.reject(error)
})


new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')

