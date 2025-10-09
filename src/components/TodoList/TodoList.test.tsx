import { render, screen, waitFor, within, act } from '@testing-library/react';
import { TodoList } from '.';
import { mockTodos } from '@/core/__tests__/mocks/todos';
import { Todo } from '@/core/todo/schemas/todo.contract';
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

describe('<TodoList /> (integration)', () => {
  test('deve desativar os items da lista enquanto envia a action', async () => {
    renderList({ delay: 50 }); // aumentei o delay para testar com segurança

    const list = screen.getByRole('list', { name: /lista de tarefas/i });
    const items = screen.getAllByRole('listitem');
    const btns = within(list).getAllByRole('button');

    const expectedDisabledCls = 'bg-gray-200 text-gray-900 hover:scale-100';
    const expectedEnabledCls = 'bg-amber-200 text-amber-900 hover:scale-105';

    // dispara a ação dentro do act
    await act(async () => {
      await user.click(btns[1]);
    });

    // espera os itens entrarem no estado pending
    await waitFor(() => {
      items.forEach(item => {
        expect(item).toHaveClass(expectedDisabledCls);
      });
    }, { timeout: 2000 });

    // espera os itens voltarem ao estado enabled
    await waitFor(() => {
      items.forEach(item => {
        expect(item).toHaveClass(expectedEnabledCls);
      });
    }, { timeout: 2000 });
  });

  test('deve desativar os botões da lista enquanto envia a action', async () => {
    renderList({ delay: 50 });

    const list = screen.getByRole('list', { name: /lista de tarefas/i });
    const btns = within(list).getAllByRole('button');

    // dispara a ação dentro do act
    await act(async () => {
      await user.click(btns[1]);
    });

    // verifica se os botões ficam desativados
    await waitFor(() => {
      btns.forEach(btn => expect(btn).toBeDisabled());
    }, { timeout: 2000 });

    // verifica se os botões voltam a ficar ativos
    await waitFor(() => {
      btns.forEach(btn => expect(btn).toBeEnabled());
    }, { timeout: 2000 });
  });
});

type RenderListProps = {
  delay?: number;
  success?: boolean;
  todos?: Todo[];
};

function renderList({
  delay = 0,
  success = true,
  todos = mockTodos,
}: RenderListProps = {}) {
  const newTodos = [...todos];
  const actionSuccessResult = {
    success: true,
    todo: { id: 'id', description: 'desc', createdAt: 'createdAt' },
  };
  const actionErrorResult = {
    success: false,
    errors: ['falha ao apagar todo'],
  };
  const actionResult = success ? actionSuccessResult : actionErrorResult;

  const actionNoDelay = vi.fn().mockResolvedValue(actionResult);
  const actionDelayed = vi.fn().mockImplementation(async () => {
    await new Promise(r => setTimeout(r, delay));
    return actionResult;
  });
  const action = delay > 0 ? actionDelayed : actionNoDelay;

  const renderResult = render(<TodoList action={action} todos={newTodos} />);

  return { action, renderResult, todos: newTodos };
}
