import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataGrid } from './index';

describe('DataGrid', () => {
  it('renders header content and row data', () => {
    render(
      React.createElement(DataGrid, {
        rowKey: 'id',
        headerContent: React.createElement('h2', null, 'Users'),
        dataSource: [{ id: '1', email: 'admin@example.com' }],
        columns: [{ title: 'Email', dataIndex: 'email', key: 'email' }],
      })
    );

    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });
});
