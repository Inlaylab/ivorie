import { describeAuthForm } from '../testing/auth-form'
import { SignupForm } from './components/signup-form'
import { Signup01, meta } from './signup-01'

describeAuthForm({
  name: 'signup-01',
  meta,
  page: Signup01,
  form: SignupForm,
  fill: { 'signup-01-name': 'Ada Lovelace', 'signup-01-email': 'ada@example.com', 'signup-01-password': 'password123', 'signup-01-confirm': 'password123' },
  expected: { name: 'Ada Lovelace', email: 'ada@example.com', password: 'password123' },
  errors: 4, provider: { label: 'Sign up with Google', value: 'google' }, confirm: 'signup-01-confirm',
})
