import { describeAuthForm } from '../testing/auth-form'
import { SignupForm } from './components/signup-form'
import { Signup02, meta } from './signup-02'

describeAuthForm({
  name: 'signup-02',
  meta,
  page: Signup02,
  form: SignupForm,
  fill: { 'signup-02-name': 'Ada Lovelace', 'signup-02-email': 'ada@example.com', 'signup-02-password': 'password123', 'signup-02-confirm': 'password123' },
  expected: { name: 'Ada Lovelace', email: 'ada@example.com', password: 'password123' },
  errors: 4, provider: { label: 'Sign up with GitHub', value: 'github' }, confirm: 'signup-02-confirm',
})
