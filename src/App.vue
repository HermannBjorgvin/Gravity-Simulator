<template>
  <div id="app">
    <!-- <a href="https://github.com/HermannBjorgvin/Gravity-Experiments"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png"></a> -->

    <canvas ref="gravity" id="gravity" context-menu="none"></canvas>
    <div class="menu">
      <!-- <h4>Left click to build a custom mass (hard)</h4> -->
      <!-- <h4>Right click to make an orbiting mass (fun)</h4> -->
      <label><input type="number" id="menu-orbit-mass" value="2" min="1"> Default mass</label><br>
      <label><input type="number" id="menu-disk-density" value="2" min="0" step="0.1"> Disk Density</label><br>
      <label><input type="number" step="10"  id="menu-mass-multiplier" value="200"> Exaggerate size</label><br>
      <label><input type="number" id="menu-zoom" value="1" min="0" step="0.1"> Zoom</label><br>
      <label><input type="number" id="menu-speed" value="1" step="0.1"> Calculation steps</label><br>
      <label><input type="checkbox" id="menu-toggle-grid" checked="checked"> Show grid</label><br>
      <label><input type="checkbox" id="menu-toggle-custom-mass"> Custom mass on right click</label><br>
      <label><input type="checkbox" id="menu-toggle-draw-path" checked="checked"> Draw paths</label><br>
      <button id="menu-cycle-focus">Switch focus</button>
      <button id="menu-reset-camera">Center camera</button><br>
      <button id="menu-clear-spacetime">Erase</button>
      <button id="menu-gen-disk">Protoplanetary disk</button>
    </div>
  </div>
</template>

<script>
import App from './app/simulator';

export default {
  mounted(){
    App.start(this.$refs.gravity);
  }
}
</script>
