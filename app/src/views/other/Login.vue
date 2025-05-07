<script setup lang="ts">
import auth from '@/api/auth'
import install from '@/api/install'
import passkey from '@/api/passkey'
import Authorization from '@/components/TwoFA/Authorization.vue'
import gettext from '@/gettext'
import { useUserStore } from '@/pinia'
import { KeyOutlined, LockOutlined, UserOutlined } from '@ant-design/icons-vue'
import { startAuthentication } from '@simplewebauthn/browser'
import { Form, message } from 'ant-design-vue'
import LoginHeader from './LoginHeader.vue';
import Logo from '@/components/Logo/Logo.vue'

const thisYear = new Date().getFullYear()

const route = useRoute()
const router = useRouter()

install.get_lock().then(async (r: { lock: boolean }) => {
  if (!r.lock)
    await router.push('/install')
})

const loading = ref(false)
const enabled2FA = ref(false)
const refOTP = ref()
const passcode = ref('')
const recoveryCode = ref('')
const passkeyConfigStatus = ref(false)

const modelRef = reactive({
  username: '',
  password: '',
})

const rulesRef = reactive({
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
})

const { validate, validateInfos, clearValidate } = Form.useForm(modelRef, rulesRef)
const userStore = useUserStore()
const { login, passkeyLogin } = userStore
const { secureSessionId } = storeToRefs(userStore)

function onSubmit() {
  validate().then(async () => {
    loading.value = true

    await auth.login(modelRef.username, modelRef.password, passcode.value, recoveryCode.value).then(async r => {
      const next = (route.query?.next || '').toString() || '/'
      switch (r.code) {
        case 200:
          message.success($gettext('Login successful'), 1)
          login(r.token)
          await nextTick()
          secureSessionId.value = r.secure_session_id
          await router.push(next)
          break
        case 199:
          enabled2FA.value = true
          break
      }
    }).catch(e => {
      switch (e.code) {
        case 4031:
          message.error($gettext('Incorrect username or password'))
          break
        case 4291:
          message.error($gettext('Too many login failed attempts, please try again later'))
          break
        case 4033:
          message.error($gettext('User is banned'))
          break
        case 4034:
          refOTP.value?.clearInput()
          message.error($gettext('Invalid 2FA or recovery code'))
          break
        default:
          message.error($gettext(e.message ?? 'Server error'))
          break
      }
    })
    loading.value = false
  })
}

const user = useUserStore()

if (user.isLogin) {
  const next = (route.query?.next || '').toString() || '/dashboard'

  router.push(next)
}

watch(() => gettext.current, () => {
  clearValidate()
})

const has_casdoor = ref(false)
const casdoor_uri = ref('')

auth.get_casdoor_uri()
  .then(r => {
    if (r?.uri) {
      has_casdoor.value = true
      casdoor_uri.value = r.uri
    }
  })
  .catch(e => {
    message.error($gettext(e.message ?? 'Server error'))
  })

function loginWithCasdoor() {
  window.location.href = casdoor_uri.value
}

if (route.query?.code !== undefined && route.query?.state !== undefined) {
  loading.value = true
  auth.casdoor_login(route.query?.code?.toString(), route.query?.state?.toString()).then(async () => {
    message.success($gettext('Login successful'), 1)

    const next = (route.query?.next || '').toString() || '/'

    await router.push(next)
  }).catch(e => {
    message.error($gettext(e.message ?? 'Server error'))
  })
  loading.value = false
}

function handleOTPSubmit(code: string, recovery: string) {
  passcode.value = code
  recoveryCode.value = recovery

  nextTick(() => {
    onSubmit()
  })
}

passkey.get_config_status().then(r => {
  passkeyConfigStatus.value = r.status
})

const passkeyLoginLoading = ref(false)
async function handlePasskeyLogin() {
  passkeyLoginLoading.value = true
  try {
    const begin = await auth.begin_passkey_login()
    const asseResp = await startAuthentication({ optionsJSON: begin.options.publicKey })

    const r = await auth.finish_passkey_login({
      session_id: begin.session_id,
      options: asseResp,
    })

    if (r.token) {
      const next = (route.query?.next || '').toString() || '/'

      passkeyLogin(asseResp.rawId, r.token)
      secureSessionId.value = r.secure_session_id
      await router.push(next)
    }
  }
  // eslint-disable-next-line ts/no-explicit-any
  catch (e: any) {
    message.error($gettext(e.message ?? 'Server error'))
  }
  passkeyLoginLoading.value = false
}
</script>

<template>
  <ALayout>
    <ALayoutHeader :style="{ position: 'sticky', top: '0', zIndex: 10, width: '100%' }">
      <LoginHeader/>
    </ALayoutHeader>
    <ALayoutContent>
      <div class="login-container">
        <div class="login-panel">
          <div class="page-title">
            <h6>Sign In</h6>
          </div>
          <div class="login-form">
            <AForm id="components-form-demo-normal-login">
              <template v-if="!enabled2FA">
                <AFormItem v-bind="validateInfos.username">
                  <label>Email or Username</label>
                  <AInput
                    v-model:value="modelRef.username"
                    :placeholder="$gettext('name@email.com')"
                    class="input-field"
                  >
                    <template #prefix>
                      <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
                    </template>
                  </AInput>
                </AFormItem>
                <AFormItem v-bind="validateInfos.password">
                  <label>Password</label>
                  <AInputPassword
                    v-model:value="modelRef.password"
                    :placeholder="$gettext('Your password')"
                    class="input-field"
                  >
                    <template #prefix>
                      <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
                    </template>
                  </AInputPassword>
                </AFormItem>
                <AButton
                  v-if="has_casdoor"
                  block
                  html-type="submit"
                  :loading="loading"
                  class="mb-5"
                  @click="loginWithCasdoor"
                >
                  {{ $gettext('SSO Login') }}
                </AButton>
              </template>
              <div v-else>
                <Authorization
                  ref="refOTP"
                  :two-f-a-status="{
                    enabled: true,
                    otp_status: true,
                    passkey_status: false,
                  }"
                  @submit-o-t-p="handleOTPSubmit"
                />
              </div>

              <AFormItem v-if="!enabled2FA">
                <AButton
                  type="primary"
                  block
                  html-type="submit"
                  :loading="loading"
                  class="mb-2 login-btn"
                  @click="onSubmit"
                >
                  {{ $gettext('Login') }}
                </AButton>

                <div
                  v-if="passkeyConfigStatus"
                  class="flex flex-col justify-center"
                >
                  <ADivider>
                    <div class="text-sm font-normal opacity-75">
                      {{ $gettext('Or') }}
                    </div>
                  </ADivider>

                  <AButton
                    :loading="passkeyLoginLoading"
                    @click="handlePasskeyLogin"
                  >
                    <KeyOutlined />
                    {{ $gettext('Sign in with a passkey') }}
                  </AButton>
                </div>
              </AFormItem>
            </AForm>
          </div>
          <div class="footer">
            <Logo />
            <p>Copyright © {{thisYear}} Apporto.com.</p>
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
