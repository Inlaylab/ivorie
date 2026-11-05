import { describeAuthForm } from '../testing/auth-form'
import { SignupForm } from './components/signup-form'
import { Signup05, meta } from './signup-05'

describeAuthForm({
  name: 'signup-05',
  meta,
  page: Signup05,
  form: SignupForm,
  fill: { 'signup-05-email': 'ada@example.com' },
  expected: { email: 'ada@example.com' },
  errors: 1, provider: { label: 'Continue with Apple', value: 'apple' },
})
