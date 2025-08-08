import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProviders } from '@/providers/AppProviders';

// react-query devtools는 테스트 환경에서 렌더링 영향이 적으나, 존재 여부 체크는 하지 않음.
// react-toastify는 jest.setup.js에서 ToastContainer가 children을 그대로 반환하도록 모킹됨.

describe('AppProviders', () => {
  it('QueryClientProvider, AuthProvider 래핑 하에서 children을 렌더링한다', () => {
    render(
      <AppProviders>
        <div data-testid="content">hello</div>
      </AppProviders>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});


