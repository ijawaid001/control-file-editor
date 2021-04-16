<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        
      </div>

      <v-spacer></v-spacer>
      
    </v-app-bar>

    <v-main>
      <ReadFileList/>
    </v-main>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';
import ReadFileList from './components/ReadFileList';

export default {
  name: 'App',

  components: {
    HelloWorld,
    ReadFileList
  },

  data: () => ({
    //
  }),
};
</script>
