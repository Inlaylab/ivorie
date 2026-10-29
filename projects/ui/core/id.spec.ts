import { describe, expect, it } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { IvIdGenerator } from './id'

describe('IvIdGenerator', () => {
  it('counts from 1 per prefix call', () => {
    const ids = TestBed.inject(IvIdGenerator)
    expect(ids.next('iv-tab')).toBe('iv-tab-1')
    expect(ids.next('iv-tab')).toBe('iv-tab-2')
  })

  // Same ids on server and client: the counter lives in the app injector, not in a global.
  it('starts at 1 again in a fresh injector', () => {
    expect(TestBed.inject(IvIdGenerator).next('iv-tab')).toBe('iv-tab-1')
  })
})
