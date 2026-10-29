import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('later Tailwind class wins', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('keeps arbitrary variants next to plain classes', () => {
    expect(cn('data-[state=open]:bg-accent', 'bg-red-500')).toBe('data-[state=open]:bg-accent bg-red-500')
  })

  it('keeps non-Tailwind classes', () => {
    expect(cn('iv-scroll-area-viewport', 'size-full')).toBe('iv-scroll-area-viewport size-full')
  })
})
