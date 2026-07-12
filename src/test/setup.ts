import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { useSimulationStore } from '../store/useSimulationStore'

beforeEach(() => useSimulationStore.setState({ stage: 0, playing: false, speed: 1, mode: 'beginner' }))
afterEach(() => cleanup())
