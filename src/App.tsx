import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, BrainCircuit, ChevronLeft, ChevronRight, CircleHelp, Equal, Gauge, Pause, Play, RotateCcw, Sparkles } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { runMiniTransformer, type Matrix, type TransformerTrace } from './lib/transformer'
import { useSimulationStore } from './store/useSimulationStore'

const EXAMPLES = ['하늘은 왜 파란가요?', '비는 어떻게 내리나요?', '고양이는 왜 잠을 많이 자나요?']
const FORMULAS = ['xᵢ = E[tokenᵢ]', 'zᵢ = xᵢ + PE(i)', 'Q = zWQ · K = zWK · V = zWV', 'softmax(QKᵀ / √dₖ)V', 'ReLU(xW₁)W₂', 'eˡⁱ / Σeˡʲ', 'P(next token | context)']

function VectorGrid({ matrix, labels }: { matrix: Matrix; labels: string[] }) {
  const values = matrix.flat()
  const max = Math.max(...values.map(Math.abs), 1)
  return <div className="matrix-wrap" aria-label="벡터 행렬">
    {matrix.map((row, i) => <div className="matrix-row" key={labels[i] ?? i}>
      <span>{labels[i] ?? `t${i + 1}`}</span>
      <div className="matrix-cells">{row.map((value, j) => {
        const positive = value >= 0
        const alpha = .18 + Math.abs(value) / max * .7
        return <motion.b key={j} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: j * .04 }} style={{ background: positive ? `rgba(14,165,233,${alpha})` : `rgba(244,114,182,${alpha})` }}>{value.toFixed(2)}</motion.b>
      })}</div>
    </div>)}
  </div>
}

function AttentionMap({ trace }: { trace: TransformerTrace }) {
  const n = trace.tokens.length
  const width = 680
  const rowGap = 60
  return <div className="attention-map">
    <svg viewBox={`0 0 ${width} ${Math.max(230, n * rowGap + 48)}`} role="img" aria-label="토큰 간 어텐션 연결도">
      {trace.tokens.map((token, i) => <g key={`left-${token}-${i}`}><rect x="18" y={30 + i * rowGap} rx="14" width="112" height="38" fill="#e0f2fe"/><text x="74" y={54 + i * rowGap} textAnchor="middle">{token}</text></g>)}
      {trace.tokens.map((token, i) => <g key={`right-${token}-${i}`}><rect x="550" y={30 + i * rowGap} rx="14" width="112" height="38" fill="#f0f9ff" stroke="#7dd3fc"/><text x="606" y={54 + i * rowGap} textAnchor="middle">{token}</text></g>)}
      {trace.attentionWeights.flatMap((row, i) => row.map((weight, j) => <motion.path key={`${i}-${j}`} d={`M130 ${49 + i * rowGap} C300 ${49 + i * rowGap}, 380 ${49 + j * rowGap}, 550 ${49 + j * rowGap}`} fill="none" stroke="#0ea5e9" strokeWidth={1 + weight * 10} opacity={.16 + weight * .75} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .55, delay: (i + j) * .04 }}/>))}
    </svg>
  </div>
}

function SoftmaxBars({ trace }: { trace: TransformerTrace }) {
  return <div className="probabilities">{trace.probabilities.map((item, index) => <div className="probability" key={item.token}>
    <div><span>{item.token}</span><strong>{(item.value * 100).toFixed(1)}%</strong></div>
    <div className="bar"><motion.i initial={{ width: 0 }} animate={{ width: `${item.value * 100}%` }} transition={{ duration: .5, delay: index * .08 }}/></div>
  </div>)}</div>
}

function StageVisual({ trace, stage }: { trace: TransformerTrace; stage: number }) {
  const current = trace.stages[stage]
  if (current.id === 'tokenize') return <div className="token-line">{trace.tokens.map((token, i) => <motion.span key={`${token}-${i}`} initial={{ opacity: 0, scale: .95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: i * .11 }}>{token}<small>token {i + 1}</small></motion.span>)}</div>
  if (current.id === 'embedding') return <VectorGrid matrix={trace.embeddings} labels={trace.tokens}/>
  if (current.id === 'position') return <div><div className="equation-flow"><span>Embedding</span><b>+</b><span className="wave">Position ∿</span><b>=</b><span>순서가 있는 벡터</span></div><VectorGrid matrix={trace.encoded} labels={trace.tokens}/></div>
  if (current.id === 'attention') return <AttentionMap trace={trace}/>
  if (current.id === 'ffn') return <div><div className="ffn-flow"><span>4차원 입력</span><ArrowRight/><span className="wide">6차원으로 펼치기</span><ArrowRight/><span className="relu">ReLU<br/><small>음수 끄기</small></span><ArrowRight/><span>4차원 압축</span></div><VectorGrid matrix={trace.ffnOutput} labels={trace.tokens}/></div>
  if (current.id === 'softmax') return <SoftmaxBars trace={trace}/>
  return <div className="generated-answer"><div className="typing-dot"><Sparkles/></div><p><span>선택된 첫 토큰</span><strong>{trace.nextToken}</strong></p><blockquote>{trace.answer}</blockquote><small>실제 LLM은 이 과정을 한 토큰씩 반복해 긴 답변을 만듭니다.</small></div>
}

function App() {
  const [question, setQuestion] = useState(EXAMPLES[0])
  const [trace, setTrace] = useState(() => runMiniTransformer(EXAMPLES[0]))
  const { stage, playing, speed, mode, next, previous, togglePlaying, setPlaying, setSpeed, setMode, reset, setStage } = useSimulationStore()
  const reduceMotion = useReducedMotion()
  const current = trace.stages[stage]

  useEffect(() => {
    if (!playing || stage >= trace.stages.length - 1) { if (stage >= trace.stages.length - 1) setPlaying(false); return }
    const id = window.setTimeout(() => next(trace.stages.length - 1), (reduceMotion ? 300 : 1450) / speed)
    return () => window.clearTimeout(id)
  }, [playing, stage, speed, next, setPlaying, trace.stages.length, reduceMotion])

  const matrixSummary = useMemo(() => current.matrix ? `${current.matrix.length} × ${current.matrix[0].length} 행렬` : '개념 단계', [current])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTrace(runMiniTransformer(question))
    reset()
  }

  return <main>
    <header className="hero">
      <nav><a className="brand" href="#top"><BrainCircuit/>Transformer Lab</a><a href="#lab">실험실</a><a href="#map">전체 지도</a></nav>
      <div className="hero-grid" id="top">
        <div><div className="pill"><Sparkles size={14}/>수학을 만져보는 LLM 입문</div><h1>질문이<br/><em>답변이 되는 순간</em>을<br/>눈으로 확인하세요.</h1><p>단어가 숫자가 되고, 서로를 바라보고, 다음 말을 고르는 Transformer의 7단계를 직접 재생합니다.</p><a className="primary-link" href="#lab">계산 시작하기 <ArrowRight size={18}/></a></div>
        <div className="hero-orbit" aria-hidden="true"><div className="core"><BrainCircuit/><b>LLM</b></div>{['토큰', '벡터', '관계', '확률'].map((x, i) => <motion.span key={x} animate={reduceMotion ? {} : { y: [-4, 4, -4] }} transition={{ duration: 2.8 + i * .35, repeat: Infinity, ease: 'easeInOut', delay: i * .2 }}>{x}</motion.span>)}</div>
      </div>
    </header>

    <section className="pipeline-section" id="map"><div className="section-heading"><span>THE BIG PICTURE</span><h2>한 문장이 지나가는 7개의 방</h2><p>복잡해 보여도, 한 단계씩 보면 모두 작은 계산입니다.</p></div><div className="pipeline">{trace.stages.map((item, i) => <button key={item.id} onClick={() => setStage(i)} className={i === stage ? 'active' : ''}><small>{String(i + 1).padStart(2, '0')}</small><b>{item.title.split(' ').slice(0, 2).join(' ')}</b>{i < trace.stages.length - 1 && <ArrowRight/>}</button>)}</div></section>

    <section className="lab" id="lab">
      <aside className="control-panel"><span className="section-kicker">TRY IT YOURSELF</span><h2>질문을 입력해 보세요.</h2><p>짧고 쉬운 질문일수록 계산 흐름이 잘 보여요.</p><form onSubmit={submit}><label htmlFor="question">질문 입력</label><textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={80}/><div className="examples">{EXAMPLES.map((example) => <button type="button" key={example} onClick={() => setQuestion(example)}>{example}</button>)}</div><button className="submit" type="submit">계산 시작 <ArrowRight/></button></form><div className="mode-switch"><span>설명 깊이</span><div><button className={mode === 'beginner' ? 'active' : ''} onClick={() => setMode('beginner')}>초보자 모드</button><button className={mode === 'formula' ? 'active' : ''} onClick={() => setMode('formula')}>수식 모드</button></div></div><div className="speed"><label htmlFor="speed">재생 속도 <b>{speed}×</b></label><input id="speed" type="range" min="0.5" max="2" step="0.5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}/></div></aside>

      <div className="stage-card"><div className="stage-top"><div><span>{current.eyebrow}</span><h2>{current.title}</h2></div><div className="matrix-badge"><Gauge size={16}/>{matrixSummary}</div></div><p className="plain"><CircleHelp size={19}/>{current.plain}</p>{mode === 'formula' && <div className="formula"><Equal size={18}/><code>{stage === 3 ? 'Attention(Q,K,V) = ' : ''}{FORMULAS[stage]}</code></div>}<AnimatePresence mode="wait"><motion.div className="visual-canvas" key={`${trace.question}-${current.id}-${mode}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? 0 : .22, ease: 'easeOut' }}><StageVisual trace={trace} stage={stage}/></motion.div></AnimatePresence><div className="transport"><button onClick={() => { reset(); }} aria-label="처음부터"><RotateCcw/></button><button onClick={previous} disabled={stage === 0} aria-label="이전 단계"><ChevronLeft/></button><button className="play" onClick={togglePlaying} aria-label={playing ? '일시정지' : '재생'}>{playing ? <Pause/> : <Play/>}</button><button onClick={() => next(trace.stages.length - 1)} disabled={stage === trace.stages.length - 1} aria-label="다음 단계"><ChevronRight/></button><div className="progress"><i style={{ width: `${(stage + 1) / trace.stages.length * 100}%` }}/></div><span>{stage + 1} / {trace.stages.length}</span></div></div>
    </section>

    <section className="analogy"><span className="section-kicker">REMEMBER THIS</span><h2>Transformer는 거대한<br/><em>문맥 탐정</em>입니다.</h2><div className="analogy-grid"><article><b>1</b><h3>단어를 숫자로 번역하고</h3><p>의미가 비슷한 단어는 가까운 숫자 좌표를 가져요.</p></article><article><b>2</b><h3>서로의 관계를 살핀 뒤</h3><p>지금 답하는 데 중요한 단어에 더 집중해요.</p></article><article><b>3</b><h3>다음 말을 확률로 고릅니다</h3><p>이 과정을 매우 빠르게 반복하면 자연스러운 답이 돼요.</p></article></div></section>

    <footer><div className="brand"><BrainCircuit/>Transformer Lab</div><p>실제 모델을 단순화한 교육용 시뮬레이션입니다. 숫자는 이해를 돕기 위한 작은 예시예요.</p></footer>
  </main>
}

export default App
