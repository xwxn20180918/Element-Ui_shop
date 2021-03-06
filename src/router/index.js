import Vue from 'vue'
import Router from 'vue-router'


// import Login from '../components/Login.vue'
const Login = () => import('../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import('../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import('../components/Welcome.vue')


// import Users from '../components/Users/Users.vue'
const Users = () => import('../components/Users/Users.vue')
// import Rights from '../components/Power/Rights.vue'
const Rights = () => import('../components/Power/Rights.vue')
// import Roles from '../components/Power/Roles.vue'
const Roles = () => import('../components/Power/Roles.vue')

// import Cate from '../components/Goods/Cate.vue'
const Cate = () => import('../components/Goods/Cate.vue')
// import Params from '../components/Goods/Params.vue'
const Params = () => import('../components/Goods/Params.vue')

// import List from '../components/Goods/List.vue'
const List = () => import('../components/Goods/List.vue')
// import Add from '../components/Goods/Add.vue'
const Add = () => import('../components/Goods/Add.vue')
// import Order from '../components/Order/Order.vue'
const Order = () => import('../components/Order/Order.vue')
// import Report from '../components/Report/Report.vue'
const Report = () => import('../components/Report/Report.vue')

Vue.use(Router)
//解决location错误
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
   return originalPush.call(this, location).catch(err => err)
}
const router = new Router({
    routes:[
        {
            path:'/login',
            component:Login
        },
        {
            path:'/',
            redirect: '/login'
        },
        {
            path:'/home',
            component:Home,
            children:[
                {
                  path:'/welcome',
                  component:Welcome
                },
                {
                  path:'/users',
                  component:Users
                },
                {
                  path:'/rights',
                  component:Rights
                },
                {
                  path:'/roles',
                  component:Roles
                },
                {
                  path:'/categories',
                  component:Cate
                },
                {
                  path:'/params',
                  component:Params
                },
                {
                  path:'/goods',
                  component:List,
                },
                {
                  path:'/add',
                  component:Add,
                },
                {
                  path:'/orders',
                  component:Order,
                },
                {
                  path:'/reports',
                  component:Report,
                },
                {
                  path:'/',
                  redirect:'/welcome'
                },
            ],
        },
    ]
})
//挂载路由守卫
router.beforeEach((to, from, next) => {
    //to 将要访问的路径
    //from 代表从哪个页面跳转而来
    //next 代表函数 表示放行
    if(to.path === '/login'){
        return next()
    }
    //如果不是  获取token
    const Token = window.sessionStorage.getItem('token')
    if(!Token){
        return next('/login')
    }
    next()
        

    
})
export default router