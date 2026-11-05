import { describeAuthForm } from '../testing/auth-form'
import { SignupForm } from './components/signup-form'
import { Signup03, meta } from './signup-03'

describeAuthForm({
  name: 'signup-03',
  meta,
  page: Signup03,
  form: SignupForm,
  fill: { 'signup-03-name': 'Ada Lovelace', 'signup-03-email': 'ada@example.com', 'signup-03-password': 'password123', 'signup-03-confirm': 'password123' },
  expected: { name: 'Ada Lovelace', email: 'ada@example.com', password: 'password123' },
  errors: 4, confirm: 'signup-03-confirm',
})
