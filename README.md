# Transformer Lab

질문이 답변이 되는 Transformer의 7단계를 작은 행렬 계산, SVG, 애니메이션으로 배우는 교육용 React 앱입니다.

## 기능

- 토큰화 → 임베딩 → 위치 벡터 → Attention → FFN → Softmax → 답변 생성
- 질문 예시와 결정론적 mini-transformer 계산
- 초보자 설명 / 수식 모드
- 자동 재생, 단계 이동, 속도 조절
- desktop/mobile 반응형 UI와 reduced-motion 지원

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run lint
npm test -- --run
npm run build
npm run test:e2e
```

> 실제 LLM이 아니라 학습을 위한 4차원 mini-transformer 시뮬레이션입니다.
