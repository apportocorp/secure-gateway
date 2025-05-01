<script setup lang="ts">
import type { ShallowRef } from 'vue'
import SetLanguage from '@/components/SetLanguage/SetLanguage.vue'
import SwitchAppearance from '@/components/SwitchAppearance/SwitchAppearance.vue'
import Logo from '@/components/Logo/Logo.vue'
import { MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  clickUnFold: [void]
}>()

const router = useRouter()

const headerRef = useTemplateRef('headerRef') as Readonly<ShallowRef<HTMLDivElement>>
</script>

<template>
  <div ref="headerRef" class="header">
    <div class="tool">
      <MenuUnfoldOutlined @click="emit('clickUnFold')" />
    </div>
    <Logo class="header-logo"/>
    <ASpace
      class="user-wrapper"
      :size="24"
    >
      <SetLanguage class="set_lang" />

      <SwitchAppearance />

    </ASpace>
  </div>
</template>

<style lang="less" scoped>
.header {
  height: 64px;
  padding: 0 20px 0 0;
  background: transparent;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.00);
  width: 100%;

  .header-logo {
    display: inline;
    margin-left: 10px;
  }

  a {
    color: #000000;
  }
}

.dark {
  .header {
    box-shadow: 1px 1px 0 0 #404040;

    a {
      color: #fafafa;
    }
  }
}

.tool {
  position: absolute;
  left: 20px;
  @media (min-width: 600px) {
    display: none;
  }
}

.user-wrapper {
  position: absolute;
  right: 28px;
}

.set_lang {
  display: inline;
}
</style>
