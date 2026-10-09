import { jest } from '@jest/globals';

const pool = {
  query: jest.fn(),
  execute: jest.fn()
};

export default pool;  