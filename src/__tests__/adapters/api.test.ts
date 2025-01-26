/**
 * @jest-environment jsdom
 */
import { createApiStorageAdapter } from '../../adapters/api';
import type { ApiStorageAdapterOptions, PageOwner } from '../../types';

type MockFn<T> = jest.Mock<Promise<T>> & { mockResolvedValue: (val: T) => void; mockRejectedValue: (err: Error) => void };

describe('ApiStorageAdapter', () => {
  const mockApi = {
    getAllOwners: jest.fn() as jest.MockedFunction<() => Promise<Record<string, PageOwner>>>,
    lockPage: jest.fn() as jest.MockedFunction<(pageId: string, userId: string, userName: string) => Promise<PageOwner>>,
    unlockPage: jest.fn() as jest.MockedFunction<(pageId: string, userId: string) => Promise<void>>,
    takePageOwnership: jest.fn() as jest.MockedFunction<(pageId: string, userId: string, userName: string) => Promise<PageOwner>>,
    storageKey: 'test',
  } satisfies ApiStorageAdapterOptions;

  const adapter = createApiStorageAdapter(mockApi);
  const mockOwner: PageOwner = {
    user_id: 'user-1',
    user_name: 'Test User',
    page_id: 'page-1',
    timestamp: expect.any(Number),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOwners', () => {
    it('returns owners from API', async () => {
      mockApi.getAllOwners.mockResolvedValue({ 'page-1': mockOwner });
      
      const result = await adapter.getAllPageOwners();
      expect(result).toEqual({ 'page-1': mockOwner });
      expect(mockApi.getAllOwners).toHaveBeenCalledTimes(1);
    });

    it('handles API errors', async () => {
      mockApi.getAllOwners.mockRejectedValue(new Error('API Error'));
      
      await expect(adapter.getAllPageOwners()).rejects.toThrow('API Error');
    });
  });

  describe('lockPage', () => {
    it('locks page through API', async () => {
      mockApi.lockPage.mockResolvedValue(mockOwner);
      
      const result = await adapter.lockPage('page-1', 'user-1', 'Test User');
      expect(result).toEqual(mockOwner);
      expect(mockApi.lockPage).toHaveBeenCalledWith('page-1', 'user-1', 'Test User');
    });

    it('handles lock errors', async () => {
      mockApi.lockPage.mockRejectedValue(new Error('Already locked'));
      
      await expect(
        adapter.lockPage('page-1', 'user-1', 'Test User')
      ).rejects.toThrow('Already locked');
    });
  });

  describe('unlockPage', () => {
    it('unlocks page through API', async () => {
      mockApi.unlockPage.mockResolvedValue(undefined);
      
      await adapter.unlockPage('page-1', 'user-1');
      expect(mockApi.unlockPage).toHaveBeenCalledWith('page-1', 'user-1');
    });

    it('handles unlock errors', async () => {
      mockApi.unlockPage.mockRejectedValue(new Error('Not owner'));
      
      await expect(
        adapter.unlockPage('page-1', 'user-1')
      ).rejects.toThrow('Not owner');
    });
  });

  describe('takePageOwnership', () => {
    it('takes ownership through API', async () => {
      mockApi.takePageOwnership.mockResolvedValue(mockOwner);
      
      const result = await adapter.takePageOwnership('page-1', 'user-1', 'Test User');
      expect(result).toEqual(mockOwner);
      expect(mockApi.takePageOwnership).toHaveBeenCalledWith('page-1', 'user-1', 'Test User');
    });

    it('handles take ownership errors', async () => {
      mockApi.takePageOwnership.mockRejectedValue(new Error('Cannot take ownership'));
      
      await expect(
        adapter.takePageOwnership('page-1', 'user-1', 'Test User')
      ).rejects.toThrow('Cannot take ownership');
    });
  });
}); 