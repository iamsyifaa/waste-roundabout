import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as aiService from '../services/ai.service';

/**
 * POST /api/v1/ai/classify
 * Classifies waste using Gemini AI based on description.
 * Protected route, FARMER only.
 */
export const classifyWasteHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.classifyWaste(req.body);
  res.json({
    success: true,
    message: 'Analisis AI berhasil.',
    data: result,
  });
});
