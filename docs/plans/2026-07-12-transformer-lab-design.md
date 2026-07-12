# Transformer Lab Design

## Goal
초보자가 짧은 질문이 답변 토큰으로 변환되는 과정을 직접 재생하며 embedding, positional vector, self-attention, FFN, logits, softmax를 시각·수식·애니메이션으로 이해하는 정적 React 학습 앱을 만든다.

## Scope
- 브라우저 안에서 결정론적으로 실행되는 교육용 mini-transformer
- 질문 입력, 예시 질문, 재생/일시정지/이전/다음, 속도 조절
- 초보자 설명과 수식 보기 전환
- 단계별 숫자 행렬, attention 연결선, 확률 막대, 생성 문장
- 반응형·키보드 접근성·reduced-motion 지원
- GitHub Actions test/build와 Vercel production 배포

## Non-goals
- 실제 대규모 언어 모델 실행
- 외부 LLM API 또는 사용자 API key
- 실제 자연어 전체를 처리하는 tokenizer
- 계정, backend, DB, 사용자 데이터 저장

## Architecture
`src/lib/transformer.ts`는 UI와 분리된 순수 계산 모듈이다. 작은 고정 vocabulary와 4차원 vector, 결정론적 weight matrix를 사용해 각 token의 embedding, sinusoidal positional encoding, Q/K/V, scaled dot-product attention, FFN, output logits와 softmax를 계산한다. `src/store/useSimulationStore.ts`는 현재 단계·재생 속도·보기 모드를 관리하고, React component는 계산 결과만 시각화한다.

## Learning flow
1. 질문을 작은 vocabulary token으로 정규화한다.
2. token embedding을 색상 cell과 2D projection으로 보여준다.
3. sinusoidal positional encoding을 더해 순서 정보가 생기는 과정을 보여준다.
4. Q/K/V와 `QKᵀ / √dₖ`를 숫자로 계산한다.
5. row-wise softmax를 attention 확률로 바꾸고 연결선 굵기로 표시한다.
6. attention output을 FFN의 expand → ReLU → compress 흐름으로 보인다.
7. output logits를 softmax 확률로 바꾸고 다음 token을 선택한다.
8. 선택된 token을 문장에 추가하는 모습을 재생한다.

## UI
- 흰 배경, 하늘색 accent, 짧은 문구, 일관된 card layout
- 상단 hero와 전체 pipeline diagram
- 좌측 control panel, 우측 stage canvas
- mobile에서는 세로 stack
- motion은 120–260ms, 화면 내 이동은 ease-in-out, 진입은 ease-out
- `prefers-reduced-motion`에서는 자동 이동과 반복 motion을 최소화

## Public test seams
- `tokenizeQuestion`, `softmax`, `scaledDotProductAttention`, `runMiniTransformer` 순수 함수
- 사용자가 질문을 입력하고 단계별 canvas를 이동하는 React UI
- 재생/일시정지, 속도, 초보자/수식 모드
- production build와 실제 배포 URL

## Deployment
`main` push와 pull request에서 GitHub Actions가 lint, unit/component tests, production build를 실행한다. main에서는 Vercel secrets가 있으면 CLI production deploy를 수행한다. 로컬 Vercel link와 GitHub encrypted secrets를 설정한 뒤 Actions run과 live URL을 검증한다.
