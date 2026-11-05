import { describeAuthForm } from '../testing/auth-form'
import { LoginForm } from './components/login-form'
import { Login05, meta } from './login-05'

describeAuthForm({
  name: 'login-05',
  meta,
  page: Login05,
  form: LoginForm,
  fill: { 'login-05-email': 'ada@example.com' },
  expected: { email: 'ada@example.com' },
  errors: 1, provider: { label: 'Continue with Google', value: 'google' },
})
