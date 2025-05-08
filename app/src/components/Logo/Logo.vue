<script setup lang="ts">
import logo from '@/assets/img/logo.png'
import logoText from "@/assets/img/logo-text.png"
import logoTextDark from "@/assets/img/logo-text-dark.png"
import { useSettingsStore } from '@/pinia';

defineProps({
  logoHeight: {
    type: String,
    default: "36px"
  }
})

const settings = useSettingsStore()
const isDark = computed(() => settings.theme === 'dark')
</script>

<template>
  <div class="logo" :style="{ '--img-height': logoHeight }">
    <img
      :src="logo"
      alt="logo"
    >
    <img
      class="text logo-text"
      :src="isDark?logoTextDark:logoText"
      alt="logo"
    >
    
  </div>
</template>

<style lang="less" scoped>
.dark {
  .logo {
    background-color: transparent;
  }
}

.logo {
  transition: all 0.3s;
  height: 64px;
  width: 100%;
  overflow: hidden;
  background-color: #ffffff;

  img {
    height: var(--img-height);
  }

  .logo-text {
    margin-left: 5px;
    margin-right: 0px;
  }

  p.text {
    margin: 0;
    font-size: 22px;
    line-height: 48px;
    height: 48px;
  }
}
</style>
