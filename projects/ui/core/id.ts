import { Injectable } from '@angular/core'

/**
 * Makes unique element ids. One counter per app injector, so server and client
 * render the same ids (no hydration mismatch).
 */
@Injectable({ providedIn: 'root' })
export class IvIdGenerator {
  private count = 0

  next(prefix: string): string {
    return `${prefix}-${++this.count}`
  }
}
