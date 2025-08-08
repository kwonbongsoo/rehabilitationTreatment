import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/providers/AuthProvider';

describe('AuthProvider', () => {
  it('children을 그대로 렌더링한다', () => {
    render(
      <AuthProvider>
        <div data-testid="child">child</div>
      </AuthProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
