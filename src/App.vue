<template>

  <a href="" @click="logout">Выйти</a>

  <div><img alt="Vue logo" src="./assets/logo.png" /></div>
  <ValueInput></ValueInput>
  <HistoryChart></HistoryChart>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from './components/HelloWorld.vue';
import ValueInput from './components/ValueInput.vue';
import HistoryChart from "./components/HistoryChart.vue";
import { getAuth, signOut } from "firebase/auth";

function logout() {
  const auth = getAuth();
  signOut(auth).then(() => {
    console.log("signed out");
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
