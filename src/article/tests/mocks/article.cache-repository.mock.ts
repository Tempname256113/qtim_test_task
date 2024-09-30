export const articleCacheRepositoryMock = () => ({
  cacheArticles: jest.fn().mockResolvedValue(null),
  getCachedArticles: jest.fn().mockResolvedValue(null),
  deleteAllArticles: jest.fn().mockResolvedValue(null),
});
