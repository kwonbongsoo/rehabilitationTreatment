/**
 * Form 컴포넌트 테스트
 *
 * 공통 폼 컴포넌트들의 렌더링, 접근성, 상호작용을 테스트합니다.
 * 사이드이펙트 방지를 위해 모든 이벤트와 의존성을 모킹합니다.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormRadioGroup,
  FormFieldGroup,
  FormActions,
  FormContainer,
} from '../Form';

// 콘솔 경고 모킹 (CSS 모듈 관련)
const mockConsoleWarn = jest.fn();
global.console.warn = mockConsoleWarn;

describe('FormInput', () => {
  const defaultProps = {
    label: '테스트 입력',
    id: 'test-input',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleWarn.mockClear();
  });

  describe('기본 렌더링', () => {
    it('라벨과 입력 필드가 올바르게 렌더링되어야 한다', () => {
      render(<FormInput {...defaultProps} />);

      expect(screen.getByLabelText('테스트 입력')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('ID와 name 속성이 올바르게 설정되어야 한다', () => {
      render(<FormInput {...defaultProps} name="custom-name" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'custom-name');
    });

    it('name이 제공되지 않으면 id를 사용해야 한다', () => {
      render(<FormInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'test-input');
    });

    it('다양한 input 타입이 지원되어야 한다', () => {
      const { rerender } = render(<FormInput {...defaultProps} type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

      rerender(<FormInput {...defaultProps} type="password" />);
      expect(screen.getByLabelText('테스트 입력')).toHaveAttribute('type', 'password');

      rerender(<FormInput {...defaultProps} type="number" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
    });
  });

  describe('필수 필드 표시', () => {
    it('required가 true일 때 required 속성이 설정되어야 한다', () => {
      render(<FormInput {...defaultProps} required />);

      expect(screen.getByRole('textbox')).toHaveAttribute('required');
    });

    it('required가 false일 때 required 속성이 설정되지 않아야 한다', () => {
      render(<FormInput {...defaultProps} required={false} />);

      expect(screen.getByRole('textbox')).not.toHaveAttribute('required');
    });
  });

  describe('에러 상태', () => {
    it('에러가 있을 때 에러 메시지가 표시되어야 한다', () => {
      render(<FormInput {...defaultProps} error="입력값이 올바르지 않습니다" />);

      expect(screen.getByText('입력값이 올바르지 않습니다')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('에러가 있을 때 aria-invalid가 true여야 한다', () => {
      render(<FormInput {...defaultProps} error="에러 메시지" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('에러가 있을 때 aria-describedby가 에러 ID를 참조해야 한다', () => {
      render(<FormInput {...defaultProps} error="에러 메시지" />);

      const input = screen.getByRole('textbox');
      const errorElement = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
      expect(errorElement).toHaveAttribute('id', 'test-input-error');
    });
  });

  describe('헬프 텍스트', () => {
    it('헬프 텍스트가 표시되어야 한다', () => {
      render(<FormInput {...defaultProps} helpText="도움말 텍스트" />);

      expect(screen.getByText('도움말 텍스트')).toBeInTheDocument();
    });

    it('에러가 있을 때는 헬프 텍스트가 숨겨져야 한다', () => {
      render(<FormInput {...defaultProps} error="에러 메시지" helpText="도움말 텍스트" />);

      expect(screen.getByText('에러 메시지')).toBeInTheDocument();
      expect(screen.queryByText('도움말 텍스트')).not.toBeInTheDocument();
    });

    it('헬프 텍스트가 있을 때 aria-describedby가 헬프 ID를 참조해야 한다', () => {
      render(<FormInput {...defaultProps} helpText="도움말 텍스트" />);

      const input = screen.getByRole('textbox');
      const helpElement = screen.getByText('도움말 텍스트');

      expect(input).toHaveAttribute('aria-describedby', 'test-input-help');
      expect(helpElement).toHaveAttribute('id', 'test-input-help');
    });
  });

  describe('비활성 상태', () => {
    it('disabled일 때 입력 필드가 비활성화되어야 한다', () => {
      render(<FormInput {...defaultProps} disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('사용자 상호작용', () => {
    it('값 입력이 올바르게 동작해야 한다', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<FormInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '테스트 값');

      expect(mockOnChange).toHaveBeenCalledTimes(5); // '테스트 값' = 5글자
    });

    it('포커스 이벤트가 올바르게 동작해야 한다', async () => {
      const user = userEvent.setup();
      const mockOnFocus = jest.fn();
      const mockOnBlur = jest.fn();

      render(<FormInput {...defaultProps} onFocus={mockOnFocus} onBlur={mockOnBlur} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      expect(mockOnFocus).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });
});

describe('FormSelect', () => {
  const defaultProps = {
    label: '테스트 선택',
    id: 'test-select',
    options: [
      { value: 'option1', label: '옵션 1' },
      { value: 'option2', label: '옵션 2' },
      { value: 'option3', label: '옵션 3', disabled: true },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('라벨과 선택 필드가 올바르게 렌더링되어야 한다', () => {
      render(<FormSelect {...defaultProps} />);

      expect(screen.getByLabelText('테스트 선택')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('모든 옵션이 렌더링되어야 한다', () => {
      render(<FormSelect {...defaultProps} />);

      expect(screen.getByRole('option', { name: '옵션 1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '옵션 2' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '옵션 3' })).toBeInTheDocument();
    });

    it('비활성화된 옵션이 올바르게 처리되어야 한다', () => {
      render(<FormSelect {...defaultProps} />);

      const disabledOption = screen.getByRole('option', { name: '옵션 3' });
      expect(disabledOption).toBeDisabled();
    });

    it('플레이스홀더가 표시되어야 한다', () => {
      render(<FormSelect {...defaultProps} placeholder="선택해주세요" />);

      expect(screen.getByRole('option', { name: '선택해주세요' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '선택해주세요' })).toBeDisabled();
    });
  });

  describe('사용자 상호작용', () => {
    it('옵션 선택이 올바르게 동작해야 한다', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<FormSelect {...defaultProps} onChange={mockOnChange} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option2');

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(select).toHaveValue('option2');
    });
  });
});

describe('FormTextarea', () => {
  const defaultProps = {
    label: '테스트 텍스트영역',
    id: 'test-textarea',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('라벨과 텍스트영역이 올바르게 렌더링되어야 한다', () => {
      render(<FormTextarea {...defaultProps} />);

      expect(screen.getByLabelText('테스트 텍스트영역')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('기본 rows가 4로 설정되어야 한다', () => {
      render(<FormTextarea {...defaultProps} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
    });

    it('custom rows가 적용되어야 한다', () => {
      render(<FormTextarea {...defaultProps} rows={6} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '6');
    });
  });

  describe('사용자 상호작용', () => {
    it('텍스트 입력이 올바르게 동작해야 한다', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<FormTextarea {...defaultProps} onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '여러 줄\n텍스트 입력');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});

describe('FormCheckbox', () => {
  const defaultProps = {
    label: '동의합니다',
    id: 'test-checkbox',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('라벨과 체크박스가 올바르게 렌더링되어야 한다', () => {
      render(<FormCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByLabelText('동의합니다');

      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it('체크박스와 라벨이 올바르게 연결되어야 한다', () => {
      render(<FormCheckbox {...defaultProps} />);

      const checkbox = screen.getByLabelText('동의합니다');

      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
      // 라벨과 연결된 input을 getByLabelText로 찾았기 때문에 연결이 이미 검증됨
    });
  });

  describe('사용자 상호작용', () => {
    it('체크박스 클릭이 올바르게 동작해야 한다', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<FormCheckbox {...defaultProps} onChange={mockOnChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(checkbox).toBeChecked();
    });

    it('라벨 클릭으로도 체크박스가 토글되어야 한다', async () => {
      const user = userEvent.setup();

      render(<FormCheckbox {...defaultProps} />);

      const label = screen.getByText('동의합니다');
      const checkbox = screen.getByRole('checkbox');

      await user.click(label);
      expect(checkbox).toBeChecked();
    });
  });
});

describe('FormRadioGroup', () => {
  const defaultProps = {
    label: '테스트 라디오 그룹',
    id: 'test-radio',
    options: [
      { value: 'option1', label: '옵션 1' },
      { value: 'option2', label: '옵션 2' },
      { value: 'option3', label: '옵션 3', disabled: true },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('fieldset과 legend가 올바르게 렌더링되어야 한다', () => {
      render(<FormRadioGroup {...defaultProps} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('테스트 라디오 그룹')).toBeInTheDocument();
    });

    it('모든 라디오 버튼이 렌더링되어야 한다', () => {
      render(<FormRadioGroup {...defaultProps} />);

      expect(screen.getByRole('radio', { name: '옵션 1' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: '옵션 2' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: '옵션 3' })).toBeInTheDocument();
    });

    it('같은 name 속성을 가져야 한다', () => {
      render(<FormRadioGroup {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'test-radio');
      });
    });

    it('비활성화된 옵션이 올바르게 처리되어야 한다', () => {
      render(<FormRadioGroup {...defaultProps} />);

      const disabledRadio = screen.getByRole('radio', { name: '옵션 3' });
      expect(disabledRadio).toBeDisabled();
    });
  });

  describe('선택 상태', () => {
    it('초기 선택값이 올바르게 설정되어야 한다', () => {
      render(<FormRadioGroup {...defaultProps} value="option2" />);

      const selectedRadio = screen.getByRole('radio', { name: '옵션 2' });
      expect(selectedRadio).toBeChecked();
    });
  });

  describe('사용자 상호작용', () => {
    it('라디오 버튼 선택이 올바르게 동작해야 한다', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<FormRadioGroup {...defaultProps} value="option1" onChange={mockOnChange} />);

      const radio = screen.getByRole('radio', { name: '옵션 1' });
      expect(radio).toBeChecked();

      // 다른 옵션 선택
      const radio2 = screen.getByRole('radio', { name: '옵션 2' });
      await user.click(radio2);

      expect(mockOnChange).toHaveBeenCalledWith('option2');
    });
  });
});

describe('FormFieldGroup', () => {
  const children = <div>테스트 콘텐츠</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('children이 올바르게 렌더링되어야 한다', () => {
      render(<FormFieldGroup>{children}</FormFieldGroup>);

      expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
    });

    it('title이 표시되어야 한다', () => {
      render(<FormFieldGroup title="그룹 제목">{children}</FormFieldGroup>);

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByText('그룹 제목')).toBeInTheDocument();
    });

    it('description이 표시되어야 한다', () => {
      render(<FormFieldGroup description="그룹 설명">{children}</FormFieldGroup>);

      expect(screen.getByText('그룹 설명')).toBeInTheDocument();
    });

    it('title과 description이 모두 표시되어야 한다', () => {
      render(
        <FormFieldGroup title="그룹 제목" description="그룹 설명">
          {children}
        </FormFieldGroup>,
      );

      expect(screen.getByText('그룹 제목')).toBeInTheDocument();
      expect(screen.getByText('그룹 설명')).toBeInTheDocument();
    });
  });
});

describe('FormActions', () => {
  const children = (
    <>
      <button type="button">취소</button>
      <button type="submit">확인</button>
    </>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('children이 올바르게 렌더링되어야 한다', () => {
      render(<FormActions>{children}</FormActions>);

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    });
  });

  describe('정렬 옵션', () => {
    it('기본적으로 오른쪽 정렬이 적용되어야 한다', () => {
      render(<FormActions>{children}</FormActions>);

      const container = screen.getByTestId('form-actions');
      expect(container).toHaveClass('right');
    });

    it('왼쪽 정렬이 적용되어야 한다', () => {
      render(<FormActions align="left">{children}</FormActions>);
      const container = screen.getByTestId('form-actions');
      expect(container).toHaveClass('left');
    });

    it('가운데 정렬이 적용되어야 한다', () => {
      render(<FormActions align="center">{children}</FormActions>);
      const container = screen.getByTestId('form-actions');
      expect(container).toHaveClass('center');
    });

    it('양끝 정렬이 적용되어야 한다', () => {
      render(<FormActions align="space-between">{children}</FormActions>);
      const container = screen.getByTestId('form-actions');
      expect(container).toHaveClass('spaceBetween');
    });
  });
});

describe('FormContainer', () => {
  const children = <div>폼 내용</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('form 요소가 올바르게 렌더링되어야 한다', () => {
      render(<FormContainer>{children}</FormContainer>);

      const formElement = screen.getByTestId('form-container');
      expect(formElement).toBeInTheDocument();
      expect(screen.getByText('폼 내용')).toBeInTheDocument();
    });

    it('기본적으로 noValidate가 true여야 한다', () => {
      render(<FormContainer>{children}</FormContainer>);

      const formElement = screen.getByTestId('form-container');
      expect(formElement).toHaveAttribute('novalidate');
    });

    it('noValidate를 false로 설정할 수 있어야 한다', () => {
      render(<FormContainer noValidate={false}>{children}</FormContainer>);

      const formElement = screen.getByTestId('form-container');
      expect(formElement).not.toHaveAttribute('novalidate');
    });
  });

  describe('폼 제출', () => {
    it('onSubmit 이벤트가 올바르게 처리되어야 한다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn((e) => e.preventDefault());

      render(
        <FormContainer onSubmit={mockOnSubmit}>
          <button type="submit">제출</button>
        </FormContainer>,
      );

      const submitButton = screen.getByRole('button', { name: '제출' });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Form 컴포넌트 통합', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('완전한 폼이 올바르게 동작해야 한다', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn((e) => e.preventDefault());

    render(
      <FormContainer onSubmit={mockOnSubmit}>
        <FormFieldGroup title="사용자 정보">
          <FormInput label="이름" id="name" required />
          <FormInput label="이메일" id="email" type="email" required />
          <FormSelect
            label="국가"
            id="country"
            options={[
              { value: 'kr', label: '한국' },
              { value: 'us', label: '미국' },
            ]}
          />
        </FormFieldGroup>

        <FormFieldGroup title="추가 정보">
          <FormTextarea label="메모" id="memo" rows={3} />
          <FormCheckbox label="이메일 수신 동의" id="email-consent" />
          <FormRadioGroup
            label="성별"
            id="gender"
            options={[
              { value: 'male', label: '남성' },
              { value: 'female', label: '여성' },
            ]}
          />
        </FormFieldGroup>

        <FormActions>
          <button type="button">취소</button>
          <button type="submit">저장</button>
        </FormActions>
      </FormContainer>,
    );

    // 모든 필드가 렌더링되는지 확인
    expect(screen.getByRole('textbox', { name: /이름/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /이메일/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /국가/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /메모/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /이메일 수신 동의/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /성별/i })).toBeInTheDocument();

    // 필수 필드 확인
    expect(screen.getByRole('textbox', { name: /이름/i })).toHaveAttribute('required');
    expect(screen.getByRole('textbox', { name: /이메일/i })).toHaveAttribute('required');

    // 사용자 상호작용 테스트
    await user.type(screen.getByRole('textbox', { name: /이름/i }), '홍길동');
    await user.type(screen.getByRole('textbox', { name: /이메일/i }), 'test@example.com');
    await user.selectOptions(screen.getByRole('combobox', { name: /국가/i }), 'kr');
    await user.type(screen.getByRole('textbox', { name: /메모/i }), '테스트 메모');
    await user.click(screen.getByRole('checkbox', { name: /이메일 수신 동의/i }));
    await user.click(screen.getByRole('radio', { name: /남성/i }));

    // 폼 제출
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });
});
