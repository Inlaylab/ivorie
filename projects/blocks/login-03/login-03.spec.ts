import { describeAuthForm } from '../testing/auth-form'
import { LoginForm } from './components/login-form'
import { Login03, meta } from './login-03'

describeAuthForm({
  name: 'login-03',
  meta,
  page: Login03,
  form: LoginForm,
  fill: { 'login-03-email': 'ada@example.com', 'login-03-password': 'password123' },
  expected: { email: 'ada@example.com', password: 'password123' },
  errors: 2, provider: { label: 'Login with Apple', value: 'apple' },
})
