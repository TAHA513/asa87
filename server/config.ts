export const config = {
  database: {
    url: process.env.DATABASE_URL?.trim() || '',
  },
  // ...existing code...
};
