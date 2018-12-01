import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'

import 'normalize.css';
import "@/assets/main.css";

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
