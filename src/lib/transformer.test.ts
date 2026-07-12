import { describe, expect, it } from 'vitest'
import { positionalEncoding, runMiniTransformer, scaledDotProductAttention, softmax, tokenizeQuestion } from './transformer'

describe('mini transformer math', () => {
  it('turns logits into a stable probability distribution', () => {
    const result = softmax([1, 2, 3])
    expect(result).toEqual([0.09003057317038046, 0.24472847105479764, 0.6652409557748218])
    expect(result.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12)
  })

  it('creates known sinusoidal position values', () => {
    expect(positionalEncoding(0, 4)).toEqual([0, 1, 0, 1])
    expect(positionalEncoding(1, 4)).toEqual([
      Math.sin(1), Math.cos(1), Math.sin(0.01), Math.cos(0.01),
    ])
  })

  it('tokenizes Korean questions deterministically', () => {
    expect(tokenizeQuestion('하늘은 왜 파란가요?')).toEqual(['하늘은', '왜', '파란가요'])
  })

  it('computes scaled attention with row probabilities', () => {
    const result = scaledDotProductAttention([[1, 0], [0, 1]], [[1, 0], [0, 1]], [[2, 0], [0, 2]])
    expect(result.weights[0][0]).toBeGreaterThan(result.weights[0][1])
    expect(result.weights[0].reduce((a, b) => a + b, 0)).toBeCloseTo(1)
    expect(result.output).toHaveLength(2)
  })

  it('returns every learning stage and a generated answer', () => {
    const trace = runMiniTransformer('하늘은 왜 파란가요?')
    expect(trace.tokens).toEqual(['하늘은', '왜', '파란가요'])
    expect(trace.stages.map((stage) => stage.id)).toEqual([
      'tokenize', 'embedding', 'position', 'attention', 'ffn', 'softmax', 'output',
    ])
    expect(trace.answer.length).toBeGreaterThan(0)
    expect(trace.probabilities.reduce((a, b) => a + b.value, 0)).toBeCloseTo(1)
  })
})
