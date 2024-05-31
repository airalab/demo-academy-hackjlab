import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import robonomics from "./robonomics-interface/robonomics";

const app = createApp(App);
app.use(robonomics, { endpoint: "wss://kusama.rpc.robonomics.network/"});
app.mount('#app');
