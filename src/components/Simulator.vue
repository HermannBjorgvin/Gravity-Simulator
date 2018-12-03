<template>
  <canvas ref="gravity" id="gravity" context-menu="none"></canvas>
</template>

<script>
import App from '@/app/app';

export default {
  props: {
    zoom: {
      type: Number,
      default: 1
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    drawPath: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    options(){
      return {
        zoom: this.zoom,
        showGrid: this.showGrid,
        drawPath: this.drawPath
      };
    }
  },
  mounted(){
    App.start(this.$refs.gravity, this.options);
  },
  methods: {
    cycleFocus(){},
    resetCamera(){},
    erase(){},
    generateDisk(){

    }
  }
}
</script>
