export type Matrix = number[][]

export type LearningStage = {
  id: 'tokenize' | 'embedding' | 'position' | 'attention' | 'ffn' | 'softmax' | 'output'
  title: string
  eyebrow: string
  plain: string
  formula: string
  matrix?: Matrix
}

export type TransformerTrace = {
  question: string
  tokens: string[]
  embeddings: Matrix
  positions: Matrix
  encoded: Matrix
  attentionScores: Matrix
  attentionWeights: Matrix
  attentionOutput: Matrix
  ffnOutput: Matrix
  probabilities: { token: string; value: number }[]
  nextToken: string
  answer: string
  stages: LearningStage[]
}

const DIM = 4
const UNKNOWN = [0.12, -0.18, 0.24, 0.08]

const VOCAB: Record<string, number[]> = {
  '하늘은': [0.82, 0.18, 0.42, -0.16],
  '왜': [0.12, 0.88, -0.22, 0.38],
  '파란가요': [0.72, 0.36, 0.84, 0.16],
  '비는': [0.62, 0.12, 0.22, 0.74],
  '어떻게': [0.18, 0.78, 0.12, 0.44],
  '내리나요': [0.56, 0.24, 0.36, 0.86],
  '고양이는': [0.74, 0.52, 0.18, 0.28],
  '잠을': [0.26, 0.32, 0.78, 0.66],
  '많이': [0.38, 0.58, 0.64, 0.22],
  '자나요': [0.42, 0.2, 0.72, 0.76],
}

const WQ: Matrix = [[0.7, 0.1, 0.2, 0], [0.1, 0.8, 0, 0.1], [0.2, 0, 0.7, 0.1], [0, 0.2, 0.1, 0.7]]
const WK: Matrix = [[0.6, 0.2, 0.1, 0.1], [0.2, 0.7, 0.1, 0], [0.1, 0.1, 0.7, 0.1], [0.1, 0, 0.2, 0.7]]
const WV: Matrix = [[0.8, 0.1, 0.1, 0], [0.1, 0.7, 0.1, 0.1], [0, 0.2, 0.7, 0.1], [0.1, 0, 0.1, 0.8]]
const W1: Matrix = [[0.8, -0.2, 0.4, 0.1, 0.3, -0.1], [0.1, 0.7, -0.1, 0.4, 0.2, 0.3], [0.3, 0.1, 0.8, -0.2, 0.4, 0.2], [-0.1, 0.3, 0.2, 0.7, 0.1, 0.5]]
const W2: Matrix = [[0.6, 0.1, 0.2, 0], [0.1, 0.5, 0.1, 0.2], [0.2, 0.1, 0.6, 0.1], [0, 0.2, 0.1, 0.5], [0.3, 0, 0.2, 0.3], [0.1, 0.3, 0.1, 0.4]]

export function softmax(values: number[]): number[] {
  const max = Math.max(...values)
  const exp = values.map((value) => Math.exp(value - max))
  const sum = exp.reduce((total, value) => total + value, 0)
  return exp.map((value) => value / sum)
}

export function positionalEncoding(position: number, dimension: number): number[] {
  return Array.from({ length: dimension }, (_, index) => {
    const exponent = (2 * Math.floor(index / 2)) / dimension
    const angle = position / Math.pow(10000, exponent)
    return index % 2 === 0 ? Math.sin(angle) : Math.cos(angle)
  })
}

export function tokenizeQuestion(question: string): string[] {
  const tokens = question
    .trim()
    .replace(/[?!.,:;"'()[\]{}]/g, '')
    .split(/\s+/)
    .filter(Boolean)
  return tokens.length ? tokens.slice(0, 5) : ['질문']
}

function stableUnknown(token: string): number[] {
  const hash = [...token].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return UNKNOWN.map((value, index) => value + (((hash >> index) % 11) - 5) / 40)
}

function multiply(matrix: Matrix, weights: Matrix): Matrix {
  return matrix.map((row) => weights[0].map((_, column) => row.reduce((sum, value, index) => sum + value * weights[index][column], 0)))
}

function add(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((value, j) => value + b[i][j]))
}

export function scaledDotProductAttention(query: Matrix, key: Matrix, value: Matrix) {
  const scale = Math.sqrt(key[0].length)
  const scores = query.map((q) => key.map((k) => q.reduce((sum, item, index) => sum + item * k[index], 0) / scale))
  const weights = scores.map(softmax)
  return { scores, weights, output: multiply(weights, value) }
}

function answerFor(question: string) {
  if (question.includes('하늘') || question.includes('파란')) return { token: '빛이', answer: '빛이 공기 분자와 만나 파란빛이 더 많이 흩어지기 때문이에요.' }
  if (question.includes('비') || question.includes('내리')) return { token: '수증기가', answer: '수증기가 구름 속에서 물방울로 뭉치고 무거워져 떨어지기 때문이에요.' }
  if (question.includes('고양이') || question.includes('잠')) return { token: '에너지를', answer: '에너지를 아끼고 사냥에 대비하는 습성이 남아 있어 잠을 많이 자요.' }
  return { token: '먼저', answer: '먼저 질문의 핵심 단어 사이 관계를 찾고, 가장 자연스러운 다음 말을 고릅니다.' }
}

export function runMiniTransformer(question: string): TransformerTrace {
  const cleanQuestion = question.trim() || '하늘은 왜 파란가요?'
  const tokens = tokenizeQuestion(cleanQuestion)
  const embeddings = tokens.map((token) => VOCAB[token] ?? stableUnknown(token))
  const positions = tokens.map((_, index) => positionalEncoding(index, DIM))
  const encoded = add(embeddings, positions)
  const q = multiply(encoded, WQ)
  const k = multiply(encoded, WK)
  const v = multiply(encoded, WV)
  const attention = scaledDotProductAttention(q, k, v)
  const hidden = multiply(attention.output, W1).map((row) => row.map((value) => Math.max(0, value)))
  const ffnOutput = multiply(hidden, W2)
  const prediction = answerFor(cleanQuestion)
  const candidateTokens = [prediction.token, '그래서', '하지만', '질문은']
  const base = ffnOutput.at(-1)?.reduce((sum, value) => sum + value, 0) ?? 1
  const logits = [2.6 + base / 20, 1.25, 0.72, 0.35]
  const probabilities = candidateTokens.map((token, index) => ({ token, value: softmax(logits)[index] }))

  return {
    question: cleanQuestion,
    tokens,
    embeddings,
    positions,
    encoded,
    attentionScores: attention.scores,
    attentionWeights: attention.weights,
    attentionOutput: attention.output,
    ffnOutput,
    probabilities,
    nextToken: prediction.token,
    answer: prediction.answer,
    stages: [
      { id: 'tokenize', title: '문장을 토큰으로 나눠요', eyebrow: '01 · Tokenize', plain: '모델이 다룰 수 있는 작은 단위로 문장을 잘라요.', formula: '문장 → [토큰₁, 토큰₂, …]' },
      { id: 'embedding', title: '단어를 의미 벡터로 바꿔요', eyebrow: '02 · Embedding', plain: '각 단어를 의미의 특징이 담긴 숫자 좌표로 바꿔요.', formula: 'token → x ∈ ℝ⁴', matrix: embeddings },
      { id: 'position', title: '단어의 순서를 더해요', eyebrow: '03 · Position', plain: '같은 단어라도 놓인 순서를 알 수 있도록 파동 모양 숫자를 더해요.', formula: 'zₚ = xₚ + PE(p)', matrix: encoded },
      { id: 'attention', title: '단어끼리 서로 바라봐요', eyebrow: '04 · Attention', plain: '각 단어가 다른 단어를 얼마나 참고할지 점수를 계산해요.', formula: 'Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V', matrix: attention.weights },
      { id: 'ffn', title: '중요한 특징을 다시 가공해요', eyebrow: '05 · FFN', plain: '각 토큰을 넓게 펼쳐 필요한 특징을 켜고 다시 압축해요.', formula: 'FFN(x) = ReLU(xW₁)W₂', matrix: ffnOutput },
      { id: 'softmax', title: '다음 단어 후보를 확률로 바꿔요', eyebrow: '06 · Softmax', plain: '제각각인 점수를 합이 100%인 확률로 바꿔요.', formula: 'P(yᵢ) = eˡⁱ / Σⱼeˡʲ' },
      { id: 'output', title: '한 토큰씩 답을 이어 붙여요', eyebrow: '07 · Generate', plain: '가장 알맞은 토큰을 고르고, 같은 계산을 반복해 답변을 만들어요.', formula: 'yₜ ~ P(yₜ | y₍<t₎, 질문)' },
    ],
  }
}
