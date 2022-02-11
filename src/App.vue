<template>

  <button type="button" @click="logout">Выйти</Button>

  <h1>Капитал</h1>
  <ValueInput></ValueInput>
  <HistoryChart></HistoryChart>

  <a id="cbr-daily" style="position: fixed; bottom: 0; right: 0; color:grey;" href="https://www.cbr-xml-daily.ru/">Курсы ЦБ РФ в XML и JSON, API</a>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
