<template>
  <div class="demo">
    <div class="content">
      <img class="appicon" src="./assets/images/tboticon.png" aria-hidden="true" />
        <div class="appinfo">
            <div v-if="sessionactive" class="session">Now active: {{sessionactive}}</div>
            <a class="discord" href="https://discord.com/channels/803947358492557312/1245395009964871772" target="_blank">Discord bot assistant</a>
        </div>

        <div class="inside">
          
          <div class="userinfo">
            <div class="flexline">
              <Loader v-if="appstatus === 'waiting users'" />
              <IconCheck v-if="appstatus !== 'waiting users'" class="icon" />
              <div class="typeanimated typeanimated-1">Connecting to Robonomics parachain</div>
            </div>

            <template v-if="appstatus === 'users got' || appstatus === 'signin process'">

              <template v-if="!users || users?.length === 0">
                <div class="flexline">
                  <Loader />
                  <div class="typeanimated typeanimated-2">Add your address in the Discord bot</div>
                </div>

                <div class="plaintext">
                  <p>What address you should add:</p>
                  <ul aria-label="What address you should add">
                    <li>Polkadot address in ED25519 format</li>
                    <li>No tokens required</li>
                  </ul>
                </div>
              </template>

              <template v-if="!signedin && users && users?.length > 0">
                <div class="flexline">
                  <Loader />
                  <div class="typeanimated typeanimated-3">Sign in with your user:</div>
                </div>

                <form class="userform" @submit.prevent="signin">
                  <select v-model="user">
                      <option v-for="u in users" :key="u" :value="u">{{shortaddress(u)}}</option>
                  </select>

                  <div class="inputpassword">
                    <input :type="typepassword" v-model="userpassword" placeholder="Enter the mnemonic phrase (12 words)" />
                    <svg @click="togpassword()" class="inputpassword-eye" aria-label="Toggle password visibility" role="button" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                      viewBox="0 0 8.1 8.7" style="enable-background:new 0 0 8.1 8.7;" xml:space="preserve">
                      <g>
                        <path d="M2.1,6.6c0.1-0.2,0-0.4-0.2-0.5C1.2,5.6,0.8,5.1,0.8,4.6c0-0.5,0.3-0.9,0.9-1.3c0,0,0.1,0,0.1-0.1c0,0,0,0,0,0
                          c0.6-0.3,1.4-0.5,2.2-0.5c0,0,0,0,0,0c0,0,0,0,0,0c0.5,0,0.9,0.1,1.3,0.2c0.2,0.1,0.4-0.1,0.5-0.3C6,2.3,5.8,2.1,5.6,2.1
                          C5.2,2,4.9,1.9,4.5,1.9V0.4C4.5,0.2,4.3,0,4.1,0S3.7,0.2,3.7,0.4v1.5C3,1.9,2.3,2.1,1.8,2.3L1.2,1.1C1.1,1,0.9,0.9,0.7,1
                          C0.5,1.1,0.4,1.3,0.5,1.5l0.6,1.2C0.5,3.2,0,3.8,0,4.6c0,0.9,0.7,1.7,1.6,2.2C1.8,6.8,2,6.7,2.1,6.6z"/>
                        <path d="M4.1,4c0.1,0,0.2,0,0.3,0.1C4.5,4.2,4.8,4.2,4.9,4C5,3.8,4.9,3.6,4.8,3.4C4.6,3.3,4.3,3.2,4.1,3.2h0C3.6,3.2,3.1,3.5,2.9,4
                          C2.7,4.4,2.7,4.9,3,5.3c0.1,0.2,0.4,0.2,0.5,0.1c0.2-0.1,0.2-0.4,0.1-0.5c-0.1-0.2-0.1-0.4,0-0.6C3.7,4.1,3.9,4,4.1,4z"/>
                        <path d="M8.1,4.5l-0.4,0h0L8.1,4.5c0-0.7-0.4-1.3-0.9-1.7L8,2.1c0.1-0.2,0.1-0.4,0-0.6c-0.2-0.1-0.4-0.1-0.6,0L6.4,2.7c0,0,0,0,0,0
                          L4.7,4.5l0,0L5,4.8l0,0L4.7,4.5L4.1,5.2l0,0L2.8,6.5L1.5,8c-0.1,0.2-0.1,0.4,0,0.6c0.2,0.1,0.4,0.1,0.6,0l1.2-1.3
                          c0.3,0,0.5,0.1,0.8,0.1v0c0,0,0,0,0,0c0,0,0,0,0,0v0c1.1,0,2.1-0.3,2.8-0.7C7.6,6.1,8.1,5.4,8.1,4.5C8.1,4.6,8.1,4.5,8.1,4.5z
                          M6.5,5.9C5.9,6.2,5,6.5,4.1,6.5h0c0,0-0.1,0-0.1,0l0.7-0.8l0,0L4.4,5.4l0,0l0.3,0.3l0.6-0.6l0,0l1.5-1.6c0.3,0.3,0.6,0.7,0.6,1.1
                          C7.3,5,7.1,5.5,6.5,5.9z"/>
                      </g>
                    </svg>
                  </div>

                  <input type="submit" value="Sign in" />

                  <div class="error" v-if="signerror">{{signerror}}</div>

                  <div class="plaintext">
                    <p>If you are not in the list, add your address in the Discord bot. What address you should add:</p>
                    <ul aria-label="What address you should add">
                      <li>Polkadot address in ED25519 format</li>
                      <li>No tokens required</li>
                    </ul>
                  </div>
                </form>

              </template>

            </template>
          </div>

        </div>
    </div>
    <div class="lock">
        <IconLockLocked v-if="!signedin" />
        <IconLockUnlocked v-if="signedin" />
    </div>
    <img class="floor" src="./assets/images/jlab-room.png" aria-hidden="true" />
  </div>
</template>

<script setup>
import { computed, inject, ref, watch, onMounted } from 'vue';

import Loader from './components/icons/Loader.vue';
import IconLockLocked from './components/icons/LockLocked.vue';
import IconLockUnlocked from './components/icons/LockUnlocked.vue';
import IconCheck from './components/icons/Check.vue';

/* possible values: 'waiting users' 'users got' 'signin process' */
const appstatus = ref('waiting users');
const signerror = ref(null);

/* + datalog */
import { u8aToString } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";
import { jsonrepair } from "jsonrepair";
import { useDevices } from "./robonomics-interface/useDevices";
import { createPair, encryptor } from "./robonomics-interface/encryptor";
import { decryptMsg, getData } from "./robonomics-interface/tools";

const owner = "4HZdAcNcj85cpCNtDD5W9BwqhCTqz8heboS71WimdK1miq1h";
const controller = "4HfUX9Ex5KJZNf3ozDCSDwTY4xJ2zSt1zr15PrWuv6M4Z56z";
const RobonomicsProvider = inject("RobonomicsProvider");
const devices = useDevices(owner);
const jsonData = ref();
const gateway = ref("https://ipfs.url.today/ipfs/");
const users = ref([]);
const user = ref(null);
/* - datalog */

/* + mnemonic */
const userpassword = ref(null);
const typepassword = ref('password');

// const checkmnemonic = computed( () => {
//   // проверка на пустоту и кол-во слов
//   return userpassword.value && userpassword.value.trim().split(/\s+/).length === 12;
// });

const togpassword = () => {
  (typepassword.value === 'password') ? typepassword.value = 'text' : typepassword.value = 'password';
}
/* - mnemonic */

const sessionactive = computed( () => {
  const now = new Date(Date.now()).getHours();

  if(now >= 11 && now < 21) {
      const today = new Date(Date.now()).toLocaleDateString();
      return 'Day session ' + today;
  } else {
      const date = new Date();
      let yesterday = new Date(date.getTime());
      yesterday.setDate(date.getDate() - 1);
      return 'Night session ' + new Date(yesterday).toLocaleDateString();
  }
});

const shortaddress = address => {
  const addressArray = address.split('')
  const result = addressArray.slice(0, 6) + "..." + addressArray.slice(-6)
  return result.replace(/,/g, '')
}

const signin = () => {
  appstatus.value = 'signin process';
  signerror.value = null;
  let pair = null;

  try {
    pair = createPair(userpassword.value);
  } catch (e) {
    console.error(e);
    signerror.value = "The mnemonic phrase is not correct or it's type is not ed25519";
    appstatus.value = 'users got';
    return;
  }

  if (encodeAddress(pair.publicKey) !== encodeAddress(user.value)) {
    signerror.value = "The mnemonic phrase is not correct or it's type is not ed25519";
    appstatus.value = 'users got';
    return;
  }

  appstatus.value = 'signedin';
  const account = encryptor(pair);
  const archive = decryptMsg(jsonData.value, account, controller);

  console.log('pair', pair);
  console.log('account', account);
  console.log('archive', archive);
}

onMounted( async () => {

  /* + Get users */
  const isOnce = RobonomicsProvider.isReady.value;

  watch(
    RobonomicsProvider.isReady,
    async (isReady, _, stopWatch) => {
      if (isReady) {
        if (!isOnce) {
          stopWatch();
        }
        devices.loadDevices();
        try {
          jsonData.value = await getData(
            RobonomicsProvider.instance.value,
            controller,
            gateway.value
          );
          console.log('jsonData.value', jsonData.value);
        } catch (error) {
          console.log(error);
        }
      }
    },
    { immediate: true, once: isOnce }
  );

  watch(devices.devices, data => {
    appstatus.value = 'users got'
    users.value = data;
    if (data.length > 0) {
      user.value = data[0];
    }
  });
  /* - Get users */

})
</script>

<style scoped>
  .demo {
    background-color: var(--color-dark);
    height: 100vh;
    overflow: hidden;
    width: 100vw;
    position: relative;
    color: var(--color-green);
  }

  .floor {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    z-index: 0;
  }

  .discord {
      background: rgb(88, 101, 242);
      border-radius: 5px;
      color: #fff;
      font-weight: 900;
      padding: 0.4rem 0.8rem;
      text-decoration: none;
  }

  .discord:hover {
      background: rgb(62, 73, 194);
      color: #fff;
  }

  .appinfo {
      max-width: 320px;
      position: absolute;
      right: 1rem;
      text-align: right;
      top: 1rem;
      padding-left: 100px;
      box-sizing: content-box;
  }

  .appinfo > *:not(:last-child) {
      margin-bottom: 0.8rem;
  }

  .appicon {
      left: 1rem;
      position: absolute;
      top: 0.5rem;
      width: 80px;
  }

  .inside {
      padding: 150px 1rem;
  }

  .content {
      position: relative;
      z-index: 2;
  }

  .lock {
    position: absolute;
    z-index: 1;
    bottom: 1rem;
    right: 1rem;
  }

  .lock svg {
    width: 30px;
  }

  .flexline {
    display: flex;
    gap: 1rem;
  }

  .icon {
    width: 1rem;
    fill: var(--color-green);
  }

  .userinfo > *:not(:last-child) {
    margin-bottom: 1rem;
  }

  .userinfo .plaintext {
    padding-left: 2rem;
    font-weight: 400;
    font-size: 0.8em;
  }

  .userinfo .plaintext p {
    margin-bottom: 0.5rem;
  }

  /* + form */
  .userform {
    max-width: 400px;
    padding-left: 2rem;
  }

  .userform .plaintext {
    padding-left: 0;
  }

  select, input {
    color: var(--color-green);
    border: 0;
    border-bottom: 1px solid var(--color-green);
    font-family: var(--font-family);
    font-weight: var(--font-weight);
    font-size: var(--font-size);
    display: block;
    width: 100%;
    margin-bottom: 1rem;
  }

  select:focus, input:not(type=submit):focus {
    border-color: var(--color-yellow);
    color: var(--color-yellow);
  }

  input[type=submit] {
    border: 0;
    background: var(--color-yellow);
    color: var(--color-dark);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 2px;
  }

  select {
    appearance: none;
    background: transparent;
    background-image: url("data:image/svg+xml;utf8,<svg fill='black' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 12 19' style='enable-background:new 0 0 12 19;' xml:space='preserve'><path style='fill:greenyellow' d='M6.8,0.3c-0.5-0.5-1.2-0.5-1.7,0L0.4,5.1c-0.5,0.5-0.5,1.2,0,1.7c0.5,0.5,1.2,0.5,1.7,0l4-3.9l4,3.9c0.5,0.5,1.2,0.5,1.7,0c0.5-0.5,0.5-1.2,0-1.7L6.8,0.3z M0.4,13.9l4.8,4.8c0.5,0.5,1.2,0.5,1.7,0l4.8-4.8c0.5-0.5,0.5-1.2,0-1.7c-0.5-0.5-1.2-0.5-1.7,0l-4,3.9l-4-3.9c-0.5-0.5-1.2-0.5-1.7,0C-0.1,12.7-0.1,13.4,0.4,13.9z'/></svg>");
    background-repeat: no-repeat;
    background-position-x: calc(100% - 1rem);
    background-position-y: 50%;
    background-size: .5rem;
  }

  select:focus {
    background-image: url("data:image/svg+xml;utf8,<svg fill='black' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 12 19' style='enable-background:new 0 0 12 19;' xml:space='preserve'><path style='fill:#fffc00' d='M6.8,0.3c-0.5-0.5-1.2-0.5-1.7,0L0.4,5.1c-0.5,0.5-0.5,1.2,0,1.7c0.5,0.5,1.2,0.5,1.7,0l4-3.9l4,3.9c0.5,0.5,1.2,0.5,1.7,0c0.5-0.5,0.5-1.2,0-1.7L6.8,0.3z M0.4,13.9l4.8,4.8c0.5,0.5,1.2,0.5,1.7,0l4.8-4.8c0.5-0.5,0.5-1.2,0-1.7c-0.5-0.5-1.2-0.5-1.7,0l-4,3.9l-4-3.9c-0.5-0.5-1.2-0.5-1.7,0C-0.1,12.7-0.1,13.4,0.4,13.9z'/></svg>") !important;
  }

  .inputpassword {
    position: relative;
  }

  .inputpassword-eye {
    position: absolute;
    width: 1rem;
    bottom: 0.5rem;
    right: 0.5rem;
    cursor: pointer;
    fill: var(--color-green);
    background: var(--color-dark);
  }

  .inputpassword-eye:hover {
    fill: var(--color-yellow);
  }

  .error {
    color: var(--color-red);
    font-size: 0.8em;
    margin-bottom: 0.8rem;
  }
  /* - form */

  /* + typinh */
  .typeanimated {
      white-space: nowrap;
      overflow: hidden;
      display: flex;
  }

  .typeanimated::after {
      content: "";
      display: block;
      height: 1em;
      width: 2px;
      background-color: var(--color-green);
      animation: blink .95s step-end infinite alternate;
  }

  .typeanimated-1 {
      width: 34ch;
      animation: typing 1s steps(34);
  }

  .typeanimated-2 {
    width: 35ch;
    animation: typing 2s steps(35);
  }

  .typeanimated-3 {
    width: 23ch;
    animation: typing 2s steps(23);
  }

  @keyframes typing {
    from {
      width: 0
    }
  }

  @keyframes blink {
    50% {
      background-color: transparent;
    }
  }

  /* - typinh */

  @media screen and (max-width: 800px) {
      .jlab {
          grid-template-columns: 1fr;
      }
  }
</style>
