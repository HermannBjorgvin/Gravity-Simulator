import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'

import "@/assets/main.css";
import "@/assets/normalize.css";

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
