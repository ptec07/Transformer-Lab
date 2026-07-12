import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Transformer Lab', () => {
  it('runs a question through the visual learning stages', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('heading', { name: /질문이.*답변이 되는 순간/i })).toBeInTheDocument()
    const input = screen.getByLabelText('질문 입력')
    await user.clear(input)
    await user.type(input, '비는 어떻게 내리나요?')
    await user.click(screen.getByRole('button', { name: '계산 시작' }))

    expect(screen.getByRole('heading', { name: '문장을 토큰으로 나눠요' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다음 단계' }))
    expect(screen.getByRole('heading', { name: '단어를 의미 벡터로 바꿔요' })).toBeInTheDocument()
  })

  it('shows all seven stages as distinct, fully labeled steps', async () => {
    const user = userEvent.setup()
    render(<App />)

    const stepNavigation = screen.getByRole('navigation', { name: 'Transformer 7단계' })
    const steps = within(stepNavigation).getAllByRole('listitem')
    expect(steps).toHaveLength(7)

    const expectedStages = [
      '1단계 토큰화 문장을 토큰으로 나눠요',
      '2단계 임베딩 단어를 의미 벡터로 바꿔요',
      '3단계 위치 벡터 단어의 순서를 더해요',
      '4단계 어텐션 단어끼리 서로 바라봐요',
      '5단계 피드 포워드 네트워크 중요한 특징을 다시 가공해요',
      '6단계 소프트맥스 다음 단어 후보를 확률로 바꿔요',
      '7단계 답변 생성 한 토큰씩 답을 이어 붙여요',
    ]

    expectedStages.forEach((name) => {
      expect(within(stepNavigation).getByRole('button', { name })).toBeVisible()
    })

    const firstStep = within(stepNavigation).getByRole('button', { name: expectedStages[0] })
    const fourthStep = within(stepNavigation).getByRole('button', { name: expectedStages[3] })
    expect(firstStep).toHaveAttribute('aria-current', 'step')

    await user.click(fourthStep)
    expect(fourthStep).toHaveAttribute('aria-current', 'step')
    expect(firstStep).not.toHaveAttribute('aria-current')
    expect(screen.getByText('4 / 7')).toBeInTheDocument()
  })

  it('switches between beginner and formula views', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '수식 모드' }))
    expect(screen.getByText(/xᵢ = E\[tokenᵢ\]/)).toBeInTheDocument()
  })
})
