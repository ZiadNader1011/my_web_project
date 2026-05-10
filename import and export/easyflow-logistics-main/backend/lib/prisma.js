const { PrismaClient } = require('@prisma/client');
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;