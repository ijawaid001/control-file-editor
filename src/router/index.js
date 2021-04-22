import Vue from 'vue'
import VueRouter from 'vue-router'
import ReadFileList from '../components/ReadFileList.vue'
import ControlPipelines from '../components/ControlPipelines.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'ReadFileList',
    component: ReadFileList
  },
  {
    path: '/control-pipelines',
    name: 'ControlPipelines',
    component: ControlPipelines
  }
]

const router = new VueRouter({
  routes
})

export default router
