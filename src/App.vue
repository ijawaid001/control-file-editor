<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-toolbar-title>Accelerated Insight Control File Editor</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text><router-link to="/">File List Editor</router-link></v-btn>
      <v-btn text><router-link to="/control-pipelines">Control Pipelines Editor</router-link></v-btn>
    </v-app-bar>
    <router-view></router-view>
    <v-main>
    </v-main>
  </v-app>
</template>

<script>
import ReadFileList from './components/ReadFileList';
import ControlPipelines from './components/ControlPipelines';

export default {
  name: 'App',

  components: {
    ReadFileList,
    ControlPipelines
  },

  data: () => ({
    //
  }),
};
</script>

<style scoped>
a {
  color: white!important;
  text-decoration: none;
}
.v-btn {
  background: none;
}
</style>
