<script setup lang="ts">
import install from '@/api/install'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons-vue'

import { Form, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import LoginHeader from './LoginHeader.vue';
import Logo from '@/components/Logo/Logo.vue'

const thisYear = new Date().getFullYear()
const loading = ref(false)

const router = useRouter()

install.get_lock().then(async (r: { lock: boolean }) => {
  if (r.lock)
    await router.push('/login')
})

const modelRef = reactive({
  email: '',
  username: '',
  password: '',
  database: 'database',
})

const rulesRef = reactive({
  email: [
    {
      required: true,
      type: 'email',
      message: () => $gettext('Please input your E-mail!'),
    },
  ],
  username: [
    {
      required: true,
      message: () => $gettext('Please input your username!'),
    },
  ],
  password: [
    {
      required: true,
      message: () => $gettext('Please input your password!'),
    },
  ],
  database: [
    {
      message: () =>
        $gettext('The filename cannot contain the following characters: %{c}', { c: '& &quot; ? < > # {} % ~ / \\' }),
    },
  ],
})

const { validate, validateInfos } = Form.useForm(modelRef, rulesRef)

function onSubmit() {
  validate().then(() => {
    // modelRef
    loading.value = true

    install.install_nginx_ui(modelRef).then(async () => {
      message.success($gettext('Install successfully'))
      await router.push('/login')
    }).catch(e => {
      message.error(e.message ?? $gettext('Server error'))
    }).finally(() => {
      loading.value = false
    })
  })
}
</script>

<template>
  <ALayout>
    <ALayoutHeader :style="{ position: 'sticky', top: '0', zIndex: 10, width: '100%' }">
      <LoginHeader />
    </ALayoutHeader>
    <ALayoutContent>
      <div class="login-container">
        <div class="login-panel">
          <div class="page-title">
            <h6>Secure Gateway</h6>
          </div>
          <div class="login-form">
            <AForm id="components-form-install">
              <AFormItem v-bind="validateInfos.email">
                <label>Email</label>
                <AInput
                  v-model:value="modelRef.email"
                  :placeholder="$gettext('name@email.com')"
                >
                  <template #prefix>
                    <MailOutlined />
                  </template>
                </AInput>
              </AFormItem>
              <AFormItem v-bind="validateInfos.username">
                <label>Username</label>
                <AInput
                  v-model:value="modelRef.username"
                  :placeholder="$gettext('Your Username')"
                >
                  <template #prefix>
                    <UserOutlined />
                  </template>
                </AInput>
              </AFormItem>
              <AFormItem v-bind="validateInfos.password">
                <label>Password</label>
                <AInputPassword
                  v-model:value="modelRef.password"
                  :placeholder="$gettext('Your password')"
                >
                  <template #prefix>
                    <LockOutlined />
                  </template>
                </AInputPassword>
              </AFormItem>
              <AFormItem>
                <AButton
                  type="primary"
                  block
                  html-type="submit"
                  :loading="loading"
                  @click="onSubmit"
                  class="login-btn"
                >
                  {{ $gettext('Install') }}
                </AButton>
              </AFormItem>
            </AForm>
          </div>
          <div class="footer">
            <Logo />
            <p>Copyright © 2021 - {{ thisYear }}</p>
          </div>
        </div>
        <div class="login-background">
          <img src="./../../assets/img/background-login.webp" alt="login-bg">
        </div>
      </div>
    </ALayoutContent>
  </ALayout>
</template>

<style lang="less" scoped>
.ant-layout-content {
  background: #fff;
}

.dark .ant-layout-content {
  background: transparent;
}

.light h6{
  color: rgb(34, 83, 143);
}

.login-form::after{
    content: "";
    position: absolute;
    max-width: 371px;
    width: 100%;
    background-image: url(./../../assets/svg/tiles.svg);
    background-repeat: no-repeat;
    height: 458px;
    left: 28%;
    top: -107px;
    -webkit-transform: scale(0.9);
    -moz-transform: scale(0.9);
    -ms-transform: scale(0.9);
    transform: scale(0.9);
    -webkit-background-position: top;
    background-position: top;
    -webkit-background-size: cover;
    background-size: cover;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
    z-index:-1
}

.login-container {
  display: flex;
  height: calc(100vh - 64px);
  position: relative;

  .login-panel {
    position: relative;
    z-index: 2;
    width: 70vw;
    padding: 0 calc(20vw + 70px) 0 70px;
    height: 100%;
    background-image: linear-gradient(to left, rgba(0, 0, 0, 0), #fff 20vw);

    .login-form {
      background-color: #fff;
      border: 1px solid #D9D9D9;
      border-radius: 8px;
      padding: 30px;
      width: 400px;
      
      .input-field:focus {
        border-color: rgb(34, 83, 143);
      }
      .input-field:hover {
        border-color: rgb(34, 83, 143); 
      }

      .login-btn {
        background-color: rgb(34, 83, 143);
        box-shadow: 0px 3px 3px rgba(34, 83, 143, 0.325);
      }

      .login-btn:hover {
        background-color: rgb(18, 45, 78);
      }

      .anticon {
        color: #a8a5a5 !important;
      }
    }

    .background-tiles img {
      position: absolute;
      z-index: -1;
      right: 25vw;
      top: -40px;

      mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
    }

    .page-title {
      margin: 50px 0px;

      h6 {
        font-size: 30px;
        font-weight: 600;
        text-align: left;
      }
    }

    .footer {
      position: absolute;
      width: 100%;
      bottom: 0px;
      left: 0;
      padding: 0 30vw 0 10vw;
      text-align: center;
      font-size: 14px;
    }
  }
  
  .login-background {
    z-index: 1;
    width: 70vw;
    height: 100%;
    overflow: hidden;
    position: absolute;
    right: 0;
  }

  .login-background img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
}

body.dark {
  .login-container {
    .login-panel {
      background-image: linear-gradient(to left, rgba(0, 0, 0, 0), #000 20vw);
      .login-form {
        background-color: #000;
        border: 1px solid #494949;
      }
    }
  }
}
</style>

