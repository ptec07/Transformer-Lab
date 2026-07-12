import { render, screen } from '@testing-library/react'
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

    expect(screen.getByText('문장을 토큰으로 나눠요')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다음 단계' }))
    expect(screen.getByText('단어를 의미 벡터로 바꿔요')).toBeInTheDocument()
  })

  it('switches between beginner and formula views', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '수식 모드' }))
    expect(screen.getByText(/xᵢ = E\[tokenᵢ\]/)).toBeInTheDocument()
  })
})
