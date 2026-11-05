import { describeAuthForm } from '../testing/auth-form'
import { SignupForm } from './components/signup-form'
import { Signup04, meta } from './signup-04'

describeAuthForm({
  name: 'signup-04',
  meta,
  page: Signup04,
  form: SignupForm,
  fill: { 'signup-04-email': 'ada@example.com', 'signup-04-password': 'password123', 'signup-04-confirm': 'password123' },
  expected: { email: 'ada@example.com', password: 'password123' },
  errors: 3, provider: { label: 'Sign up with GitHub', value: 'github' }, confirm: 'signup-04-confirm',
})
