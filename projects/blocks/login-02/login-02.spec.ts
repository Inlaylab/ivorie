import { describeAuthForm } from '../testing/auth-form'
import { LoginForm } from './components/login-form'
import { Login02, meta } from './login-02'

describeAuthForm({
  name: 'login-02',
  meta,
  page: Login02,
  form: LoginForm,
  fill: { 'login-02-email': 'ada@example.com', 'login-02-password': 'password123' },
  expected: { email: 'ada@example.com', password: 'password123' },
  errors: 2, provider: { label: 'Login with GitHub', value: 'github' },
})
