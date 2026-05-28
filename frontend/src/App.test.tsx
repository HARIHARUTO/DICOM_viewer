import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn());
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = input.toString();

        if (url.includes('/health/ready')) {
          return Response.json({
            status: 'ready',
            checks: {
              postgres: 'ok',
              orthancDicomweb: 'ok',
            },
          });
        }

        return Response.json({
          studies: [
            {
              studyInstanceUid: '1.2.840.113619.2.55.3.604688433.123',
              patientName: 'Doe^Jane',
              patientId: 'PAT-7',
              accessionNumber: 'ACC-42',
              studyDate: '20260410',
              modalities: ['CT'],
              studyDescription: 'Brain CT',
              numberOfSeries: 2,
              numberOfInstances: 128,
              rawMetadata: {},
              createdAt: '2026-05-28T00:00:00.000Z',
              updatedAt: '2026-05-28T00:00:00.000Z',
            },
          ],
          total: 1,
        });
      }),
    );
  });

  it('hides study viewing from patients', async () => {
    render(<App />);

    expect(await screen.findByText('DICOM Imaging Platform')).toBeInTheDocument();
    expect(screen.getByText('Upload Scan')).toBeInTheDocument();
    expect(screen.getByText('Doctor Consultation')).toBeInTheDocument();
    expect(
      await screen.findByRole('status', {
        name: 'PACS Status Online',
      }),
    ).toHaveTextContent('Orthanc DICOMweb ready');
    expect(screen.queryByRole('button', { name: /view scan/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /studies/i })).not.toBeInTheDocument();
  });

  it('allows doctors to launch studies in OHIF', async () => {
    render(<App />);

    expect(await screen.findByText('DICOM Imaging Platform')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Select Role'), {
      target: { value: 'doctor' },
    });

    fireEvent.click(await screen.findByRole('button', { name: /view scan/i }));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('/viewer?StudyInstanceUIDs=1.2.840.113619.2.55.3.604688433.123'),
        '_blank',
        'noopener,noreferrer',
      );
    });
  });
});

