import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, IconButton } from '../Button';

describe('Button', () => {
  describe('기본 동작', () => {
    it('버튼이 렌더링되고 클릭할 수 있다', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>테스트 버튼</Button>);

      const button = screen.getByRole('button', { name: '테스트 버튼' });
      expect(button).toBeInTheDocument();

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('children이 올바르게 렌더링된다', () => {
      render(<Button>버튼 텍스트</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('버튼 텍스트');
    });

    it('HTML 버튼 속성들이 올바르게 전달된다', () => {
      render(
        <Button type="submit" id="test-button" className="custom-class">
          제출
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('id', 'test-button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('변형(variant) 속성', () => {
    it('primary 변형이 올바르게 적용된다', () => {
      render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('primary');
    });

    it('secondary 변형이 올바르게 적용된다', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('secondary');
    });

    it('outline 변형이 올바르게 적용된다', () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('outline');
    });

    it('danger 변형이 올바르게 적용된다', () => {
      render(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('danger');
    });

    it('기본 변형은 primary이다', () => {
      render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('primary');
    });
  });

  describe('크기(size) 속성', () => {
    it('small 크기가 올바르게 적용된다', () => {
      render(<Button size="small">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('small');
    });

    it('medium 크기가 올바르게 적용된다', () => {
      render(<Button size="medium">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('medium');
    });

    it('large 크기가 올바르게 적용된다', () => {
      render(<Button size="large">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('large');
    });

    it('기본 크기는 medium이다', () => {
      render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('medium');
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 사용자 경험이 적절히 제공된다', () => {
      render(<Button isLoading>테스트</Button>);

      const button = screen.getByRole('button');

      // 사용자는 로딩 텍스트로 현재 상태를 인지함
      expect(button).toHaveTextContent('로딩 중...');

      // 스크린 리더 사용자는 aria-busy 속성으로 로딩 상태를 인지함
      expect(button).toHaveAttribute('aria-busy', 'true');

      // 사용자는 버튼을 클릭할 수 없음을 인지함
      expect(button).toBeDisabled();
    });

    it('커스텀 로딩 텍스트가 표시된다', () => {
      render(
        <Button isLoading loadingText="처리 중...">
          테스트
        </Button>,
      );

      expect(screen.getByRole('button')).toHaveTextContent('처리 중...');
    });

    it('로딩 중일 때 적절한 스타일이 적용된다', () => {
      render(<Button isLoading>테스트</Button>);
      expect(screen.getByRole('button')).toHaveClass('loading');
    });
  });

  describe('비활성화 상태', () => {
    it('비활성화된 버튼이 올바르게 렌더링된다', () => {
      render(<Button disabled>비활성화</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('비활성화된 버튼에 disabled 클래스가 적용된다', () => {
      render(<Button disabled>비활성화</Button>);
      expect(screen.getByRole('button')).toHaveClass('disabled');
    });

    it('비활성화된 버튼은 클릭할 수 없다', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button disabled onClick={handleClick}>
          비활성화
        </Button>,
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('아이콘 기능', () => {
    const TestIcon = () => <span data-testid="test-icon">🎯</span>;

    it('왼쪽 아이콘이 올바르게 렌더링된다', () => {
      render(
        <Button icon={<TestIcon />} iconPosition="left">
          텍스트
        </Button>,
      );

      // 사용자는 아이콘과 텍스트의 순서를 시각적으로 인지함
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('🎯텍스트'); // 아이콘이 텍스트 앞에 있음
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('오른쪽 아이콘이 올바르게 렌더링된다', () => {
      render(
        <Button icon={<TestIcon />} iconPosition="right">
          텍스트
        </Button>,
      );

      // 사용자는 아이콘과 텍스트의 순서를 시각적으로 인지함
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('텍스트🎯'); // 아이콘이 텍스트 뒤에 있음
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('기본 아이콘 위치는 왼쪽이다', () => {
      render(<Button icon={<TestIcon />}>텍스트</Button>);

      // 기본값으로 아이콘이 텍스트 앞에 위치함을 텍스트 순서로 확인
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('🎯텍스트'); // 아이콘이 텍스트 앞에 있음
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  describe('fullWidth 속성', () => {
    it('fullWidth가 true일 때 적절한 클래스가 적용된다', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('fullWidth');
    });

    it('fullWidth가 false일 때 클래스가 적용되지 않는다', () => {
      render(<Button fullWidth={false}>Normal Width</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('fullWidth');
    });
  });

  describe('복합 상태', () => {
    it('여러 속성이 동시에 적용될 수 있다', () => {
      render(
        <Button variant="danger" size="large" fullWidth className="custom-class">
          복합 버튼
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('danger', 'large', 'fullWidth', 'custom-class');
    });

    it('로딩과 비활성화가 동시에 적용될 수 있다', () => {
      render(
        <Button isLoading disabled>
          로딩 & 비활성화
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('loading', 'disabled');
    });
  });
});

describe('IconButton', () => {
  const TestIcon = () => <span data-testid="test-icon">🎯</span>;

  it('아이콘 버튼이 올바르게 렌더링된다', () => {
    render(<IconButton icon={<TestIcon />} aria-label="테스트 아이콘 버튼" />);

    const button = screen.getByRole('button', { name: '테스트 아이콘 버튼' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('아이콘 버튼에 iconButton 클래스가 적용된다', () => {
    render(<IconButton icon={<TestIcon />} aria-label="테스트" />);
    expect(screen.getByRole('button')).toHaveClass('iconButton');
  });

  it('기본 변형은 outline이다', () => {
    render(<IconButton icon={<TestIcon />} aria-label="테스트" />);
    expect(screen.getByRole('button')).toHaveClass('outline');
  });

  it('기본 크기는 medium이다', () => {
    render(<IconButton icon={<TestIcon />} aria-label="테스트" />);
    expect(screen.getByRole('button')).toHaveClass('medium');
  });

  it('커스텀 variant와 size를 적용할 수 있다', () => {
    render(<IconButton icon={<TestIcon />} variant="primary" size="large" aria-label="테스트" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('primary', 'large');
  });

  it('aria-label이 필수 속성이다', () => {
    render(<IconButton icon={<TestIcon />} aria-label="필수 라벨" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', '필수 라벨');
  });

  it('클릭 이벤트가 올바르게 동작한다', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<IconButton icon={<TestIcon />} onClick={handleClick} aria-label="클릭 테스트" />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('로딩 상태를 지원한다', () => {
    render(<IconButton icon={<TestIcon />} isLoading aria-label="로딩 테스트" />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('loading');
  });
});
