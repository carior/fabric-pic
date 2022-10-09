<template>
  <div id="app">
    <!-- <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view /> -->
    <editor-img></editor-img>
  </div>
</template>
<script>
import EditorImg from "@/components/editor-img/index.vue";
// import EditorImg from '@/components/fabric.vue'
// import EditorImg from '@/components/fabric_origin.vue'
export default {
  components: {
    EditorImg,
  },
};
</script>
<style>
/*@import url("./assets/font/font.css");*/
* {
  padding: 0;
  margin: 0;
}
ul,
li {
  list-style-type: none;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
