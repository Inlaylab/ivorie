import { describeAuthForm } from '../testing/auth-form'
import { LoginForm } from './components/login-form'
import { Login04, meta } from './login-04'

describeAuthForm({
  name: 'login-04',
  meta,
  page: Login04,
  form: LoginForm,
  fill: { 'login-04-email': 'ada@example.com', 'login-04-password': 'password123' },
  expected: { email: 'ada@example.com', password: 'password123' },
  errors: 2, provider: { label: 'Login with Google', value: 'google' },
})
