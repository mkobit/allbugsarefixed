/* eslint-disable functional/immutable-data */
/* eslint-disable no-restricted-globals */
import { Temporal as TemporalImpl, Intl as IntlImpl, toTemporalInstant } from '@js-temporal/polyfill'

// @ts-expect-error TypeScript 6 now defines Temporal globally, but we still need to polyfill it at runtime
globalThis.Temporal = TemporalImpl
globalThis.Intl = IntlImpl as any
Date.prototype.toTemporalInstant = toTemporalInstant as any
