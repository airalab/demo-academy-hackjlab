<template>
  <div class="demo">
    <div class="content">
      <img class="appicon" src="./assets/images/tboticon.png" aria-hidden="true" />
        <div class="appinfo">
            <div v-if="sessionactive" class="session">Now active: {{sessionactive}}</div>
            <a class="discord" href="https://discord.com/channels/803947358492557312/1245395009964871772" target="_blank">Discord bot assistant</a>
        </div>

        <div class="inside">
          <!-- <video style="width:300px;height:150px;" controls>
            <source src="./assets/images/video2.mp4" type="video/mp4"/>
          </video> -->

          <template v-if="appstatus === 'notstarted'">
            <a href="javascript:;" class="button" @click.prevent="start">Start</a>
          </template>

          <template v-if="appstatus !== 'notstarted'">
        
            <div class="boxinfo" v-if="appstatus !== 'signedin'">

                <div class="flexline">
                  <Loader v-if="appstatus === 'waiting'" />
                  <IconCheck v-else class="icon" />
                  <div class="typeanimated typeanimated-1">Connecting to Robonomics parachain</div>
                </div>

                <div class="flexline" v-if="appstatus !== 'waiting'" >
                  <Loader v-if="appstatus === 'users got'" />
                  <IconCheck v-else class="icon" />
                  <div class="typeanimated typeanimated-4">Retrieving encoded data</div>
                </div>

                <template v-if="appstatus === 'signin ready' || appstatus === 'signin process'">

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

                    <template v-if="appstatus !== 'signedin' && users && users?.length > 0">
                      <div class="flexline">
                        <Loader />
                        <div class="typeanimated typeanimated-3">Decrypt with your user:</div>
                      </div>

                      <form @submit.prevent="signin">
                        <select v-model="user">
                            <option v-for="u in users" :key="u" :value="u">{{shortaddress(u)}}</option>
                        </select>

                        <div class="inputpassword">
                          <input :type="typepassword" v-model="userpassword" placeholder="Enter the mnemonic phrase (12 words)" />
                          <IconEyeCrossed @click="togpassword()" class="inputpassword-eye" />
                        </div>

                        <input type="submit" value="Hack" />

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

            <div class="boxactions" v-if="appstatus === 'signedin' && datalog && datavideo">

                <div class="map">
                  <!-- <img src="./assets/images/johnny_lab_map_8.png" class="mapimg" alt="Room plan of the Johnny's laboratory" /> -->
                  <img src="./assets/images/map.png" class="mapimg" alt="Room plan of the Johnny's laboratory" />
                  <template v-if="points?.length > 0">
                    <details 
                    v-for="(p,i) in points" :key="i" 
                    :style="'--x:' + p.x +'px; --y:' + p.y + 'px; --charlength:' + p.word.length + 'ch'"  
                    class="mappoint"
                    tabindex="0">
                      <summary><IconRobot /></summary>
                      <div class="mappoint-popup">{{p.word}}</div>
                    </details>
                  </template>
                </div>

                <div class="mapinfo">
                  <section>
                    <a :href="datavideo" target="_blank" class="button" download>Download video</a>
                    <p class="textsmall">You need this video to restore the sequence of words in the phrase.</p>
                  </section>

                  <section class="textsmall">
                    <h3>What's next:</h3>
                    <p>1. Save all words from points on the map.</p>
                    <p>2. Watch downloaded video to find out the order for the words.</p>
                    <p>3. Get access to Polkadot account with the phrase you got. Now you can transfer all tokens to other (your save personal) account. The fastest hacker in the session wins.</p>
                  </section>

                  <section class="textsmall">
                    <h3>Did't win?</h3>
                    <p>Within a week we have sessions two times each day: day & night session. Every session you can make new attempt to hack Johnny's lab and get tokens.</p>
                  </section>
                </div>
              </div>
            </template>
          </div>
      </div>
      <div class="lock">
          <IconLockLocked v-if="appstatus !== 'signedin'" />
          <template v-else>
            <IconLockUnlocked />
            {{shortaddress(user)}}
          </template>
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
import IconRobot from './components/icons/Robot.vue';
import IconEyeCrossed from './components/icons/EyeCrossed.vue';

/* possible values: 'notstarted, 'waiting' 'users got' 'signin ready' 'signin process' 'signedin' */
const appstatus = ref('notstarted');
const signerror = ref(null);

/* + datalog */
import { u8aToString } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";
import { jsonrepair } from "jsonrepair";
import { useDevices } from "./robonomics-interface/useDevices";
import { createPair, encryptor } from "./robonomics-interface/encryptor";
import { decryptMsg, getData } from "./robonomics-interface/tools";
import { unzipSync } from 'fflate';

const owner = "4HZdAcNcj85cpCNtDD5W9BwqhCTqz8heboS71WimdK1miq1h";
const controller = "4HfUX9Ex5KJZNf3ozDCSDwTY4xJ2zSt1zr15PrWuv6M4Z56z";
const RobonomicsProvider = inject("RobonomicsProvider");
const devices = useDevices(owner);
const jsonData = ref();
const gateway = ref("https://ipfs.url.today/ipfs/");
const users = ref([]);
const user = ref(null);
const datalog = ref(null);
const datavideo = ref(null);
const points = ref([]);
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

const getpoints = () => {

  const resolution = 0.01;
  const origin = [-3.01, -1.17];
  const mapheight = 378;

  let startpoint = [(-1 * origin[0])/resolution, -1 * mapheight - origin[1] / resolution];
  console.log('startpoint',startpoint);

  points.value = [];

  datalog.value.forEach( i => {
    points.value.push({
      x: Math.abs(startpoint[0] + i.robot_position_x / resolution),
      y: Math.abs(-1 * (startpoint[1] + i.robot_position_y / resolution)),
      word: i.word
    });
  });

  console.log('points.value', points.value)
}

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
    appstatus.value = 'signin ready';
    return;
  }

  if (encodeAddress(pair.publicKey) !== encodeAddress(user.value)) {
    signerror.value = "The mnemonic phrase is not correct or it's type is not ed25519";
    appstatus.value = 'signin ready';
    return;
  }

  appstatus.value = 'signedin';
  const account = encryptor(pair);
  const archive = decryptMsg(jsonData.value, account, controller);
  const unzipped = unzipSync(archive);

  try {
    datalog.value = JSON.parse(jsonrepair(u8aToString(unzipped["data.json"])));
    console.log('data.value',datalog.value);

    if(datalog.value) {
      getpoints();
    }

    const videosource = unzipped["johnny_lab_record.mp4"];
    if(videosource) {
      var content = new Blob([videosource], { type: "video/mp4" });
      datavideo.value = (window.URL || window.webkitURL).createObjectURL(content);
    }
  } catch (error) {
    console.log(error);
  }
}

const start = async () => {

    appstatus.value = 'waiting';

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

            if (jsonData.value) {
              appstatus.value = 'signin ready';
            }
          } catch (error) {
            console.log(error);
          }
        }
      },
      { immediate: true, once: isOnce }
    );

    watch(devices.devices, u => {
      appstatus.value = 'users got';
      users.value = u;

      if (u.length > 0) {
        user.value = u[0];
      }
    });

}

onMounted( () => {
  document.body.onclick = (e) => {

      const current = e.target.closest('.mappoint[tabindex="0"]'); //save clicked element to detect if it is our current detail
      document.body.querySelectorAll('.mappoint[tabindex="0"]')
          .forEach((e) => {
              if(e !== current){ //we need this condition not to break details behavior
                e.open = false
              }
      })
  }

})
</script>

<style scoped>
  .demo {
    background-color: var(--color-dark);
    min-height: 100vh;
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

  .textsmall {
    font-size: 0.8em;
  }

  section { margin: 2rem 0; }
  section:first-child { margin-top: 0; }
  section:last-child { margin-bottom: 0; }

  h3 {
    font-size: 1.5em;
    font-weight: bold;
  }

  /* + box with text & info */
  .boxinfo {
    max-width: 400px;
  }

  .boxinfo > *:not(:last-child) {
    margin-bottom: 1rem;
  }

  .boxinfo .plaintext, .boxinfo form {
    padding-left: 2rem;
    font-weight: 400;
    font-size: 0.8em;
  }

  .boxinfo form .plaintext {
    padding-left: 0;
  }

  .boxinfo .plaintext p {
    margin-bottom: 0.5rem;
  }

  /* - box with text & info */

  /* + form */

  select, input, .button {
    color: var(--color-green);
    border: 0;
    border-bottom: 1px solid var(--color-green);
    font-family: var(--font-family);
    font-weight: var(--font-weight);
    font-size: var(--font-size);
    display: block;
    width: 100%;
    margin-bottom: 1rem;
    text-decoration: none;
  }

  select:focus, input:not(type=submit):focus {
    border-color: var(--color-yellow);
    color: var(--color-yellow);
  }

  input[type=submit], .button {
    border: 1px solid var(--color-green);
    background: transparent;
    color: var(--color-green);
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 2px;
    display: inline-block;
    width: auto;
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

  /* .typeanimated::after {
      content: "";
      display: block;
      height: 1em;
      width: 2px;
      background-color: var(--color-green);
      animation: blink .95s step-end infinite alternate;
  } */

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

  .typeanimated-4 {
    width: 23ch;
    animation: typing 2s steps(23);
  }

  @keyframes typing {
    from {
      width: 0
    }
  }

  /* @keyframes blink {
    50% {
      background-color: transparent;
    }
  } */

  /* - typinh */


  /* + map & video */
  .boxactions {
    display: grid;
    grid-template-columns: 459px auto;
    gap: 2rem;
  }

  .map {
    width: 459px;
    height: 378px;
    position: relative;
    margin: 0 auto;
  }

  .map .mapimg {
    display: block;
    max-width: 100%;
  }

  .mappoint {
    --x: 0;
    --y: 0;
    --width: 1.6rem;
    position: absolute;
    left: calc(var(--x) - var(--width)/2);
    top: calc(var(--y) - var(--width)/2);
  }

  .mappoint summary::-webkit-details-marker,
  .mappoint summary::marker {
    content: "";
    display: none; 
  }

  .mappoint summary {
    cursor: pointer;
    transform-origin: 50% 50%;
    fill: var(--color-yellow);
  }

  .mappoint summary svg {
    width: var(--width);
  }

  .mappoint summary:hover {
    transform: scale(1.4);
    transition: 0.2s ease-in-out all;
    fill: #fff;
  }

  .mappoint[open] summary {
    transform: scale(1.4);
    fill: #fff;
  }

  .mapinfo {
    max-width: 700px;
  }

  .mappoint-popup {
    background-color: #fff;
    border: 1px solid var(--color-yellow);
    color: var(--color-dark);
    padding: 0.5rem;
    border-radius: 4px;
    position: absolute;
    top: -3rem;
    left: calc(50% - var(--charlength)/2 - 0.5rem);
    z-index: 100;
  }
  /* - map & video */

  @media screen and (max-width: 800px) {
      .boxactions {
          grid-template-columns: 1fr;
      }
  }
</style>
