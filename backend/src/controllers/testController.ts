import { Request, Response } from 'express';

export const getTestMessage = (_req: Request, res: Response) => {
  res.json({ message: 'Hello from the backend!' });
}; 