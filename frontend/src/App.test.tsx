import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          studies: [],
          total: 0,
        }),
      ),
    );
  });

  it('renders the worklist and keeps viewing delegated to OHIF', async () => {
    render(<App />);

    expect(await screen.findByText('DICOM Imaging Worklist')).toBeInTheDocument();
    expect(screen.getByText('Upload DICOM')).toBeInTheDocument();
    expect(screen.getByText(/open images in OHIF/i)).toBeInTheDocument();
  });
});

