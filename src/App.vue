<template>
<!-- <nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar w/ text</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarText">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Features</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Pricing</a>
        </li>
      </ul>
      <span class="navbar-text">
        Navbar text with an inline element
      </span>
    </div>
  </div>
</nav> -->
<div class="container-lg">
  <div class="my-2">
    <button type="button" class="btn btn-primary" @click="logout">Выйти</Button>
  </div>

  <h1>Капитал</h1>
  <ValueInput></ValueInput>
  <!-- <button type="button" class="btn btn-primary my-2" data-bs-toggle="button" autocomplete="off" v-model>Исторический график</button> -->
  <input type="checkbox" class="btn-check" id="btn-check" v-model="isShowingHistoryChart" autocomplete="off">
  <label class="btn btn-primary" for="btn-check">{{isShowingHistoryChart ? "Скрыть" : "Показать" }} исторический график</label>
  <HistoryChart v-if="isShowingHistoryChart"></HistoryChart>

  <div class="text-end">
    <a href="https://www.cbr-xml-daily.ru/">Курсы ЦБ РФ в XML и JSON, API</a>
  </div>
</div>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import {ref} from "vue";
import HelloWorld from './components/HelloWorld.vue';
import ValueInput from './components/ValueInput.vue';
import HistoryChart from "./components/HistoryChart.vue";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";


// onAuthStateChanged(getAuth(), (user) => {
//     // User is signed in, see docs for a list of available properties
//     // https://firebase.google.com/docs/reference/js/firebase.User
//     if (!user) {
//         console.log("dataat");
//         // return location.reload();
//     }
// });

let isShowingHistoryChart = ref(false);

function logout() {
  const auth = getAuth();
  console.log(auth);
  signOut(auth).then(() => {
    console.log("signed out");
    location.reload();
  }).catch((error) => {
    console.log("error", error);
  });
}
</script>

<style>

.fill { 
    min-height: 100%;
    height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
