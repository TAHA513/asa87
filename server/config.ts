export const config = {
  // ...existing code...
  database: {
    url: process.env.DATABASE_URL?.trim() || '',
  },
  // ...existing code...
};
