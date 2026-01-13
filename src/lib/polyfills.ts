/* eslint-disable functional/immutable-data */
/* eslint-disable no-restricted-globals */
import { Temporal, Intl, toTemporalInstant } from '@js-temporal/polyfill'

declare global {
  var Temporal: typeof Temporal
  var Intl: typeof Intl
  interface Date {
    toTemporalInstant: typeof toTemporalInstant
  }
}

globalThis.Temporal = Temporal
globalThis.Intl = Intl
Date.prototype.toTemporalInstant = toTemporalInstant
