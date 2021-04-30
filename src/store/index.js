import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    load: '',
  },
  mutations: {
    setLoad(state, newLoad) {
      state.load = newLoad
    }

  },
  actions: {
    
  },
  modules: {
  }
})
