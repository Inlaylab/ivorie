import { describe, expect, it } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { IV_CONFIG, IvorieModule, provideIvorie } from './config'

describe('IV_CONFIG', () => {
  it('reads provideIvorie()', () => {
    TestBed.configureTestingModule({ providers: [provideIvorie({ tooltipDelay: 300 })] })
    expect(TestBed.inject(IV_CONFIG).tooltipDelay).toBe(300)
  })

  it('reads IvorieModule.forRoot()', () => {
    TestBed.configureTestingModule({ imports: [IvorieModule.forRoot({ tooltipDelay: 300 })] })
    expect(TestBed.inject(IV_CONFIG).tooltipDelay).toBe(300)
  })

  it('defaults to an empty config', () => {
    expect(TestBed.inject(IV_CONFIG)).toEqual({})
  })
})
