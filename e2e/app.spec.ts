import { expect, test } from '@playwright/test'

test('walks through the transformer simulation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /질문이.*답변이 되는 순간/ })).toBeVisible()
  await page.getByLabel('질문 입력').fill('비는 어떻게 내리나요?')
  await page.getByRole('button', { name: '계산 시작' }).click()
  await expect(page.getByText('문장을 토큰으로 나눠요')).toBeVisible()
  await page.getByRole('button', { name: '다음 단계' }).click()
  await expect(page.getByText('단어를 의미 벡터로 바꿔요')).toBeVisible()
  await page.getByRole('button', { name: '수식 모드' }).click()
  await expect(page.locator('.formula')).toContainText('zᵢ = xᵢ + PE(i)')
})
