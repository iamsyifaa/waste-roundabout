import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as wasteService from '../services/waste.service';

/**
 * POST /api/v1/waste
 * Creates a new waste post (FARMER only).
 */
export const createWaste = asyncHandler(async (req: Request, res: Response) => {
  const post = await wasteService.createWastePost(req.user!.id, req.user!.role, req.body);
  res.status(201).json({ success: true, data: post });
});

/**
 * GET /api/v1/waste
 * Lists all available waste posts with pagination, search, sort, and filter.
 */
export const getAllWastes = asyncHandler(async (req: Request, res: Response) => {
  const result = await wasteService.getAllWastePosts(req.query);
  res.json({ success: true, ...result });
});

/**
 * GET /api/v1/waste/categories
 * Lists all waste categories.
 */
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await wasteService.getCategories();
  res.json({ success: true, data: categories });
});

/**
 * GET /api/v1/waste/:id
 * Gets a single waste post by ID.
 */
export const getWasteById = asyncHandler(async (req: Request, res: Response) => {
  const post = await wasteService.getWastePostById(req.params.id);
  res.json({ success: true, data: post });
});

/**
 * PUT /api/v1/waste/:id
 * Updates a waste post (FARMER only, own post, AVAILABLE only).
 */
export const updateWaste = asyncHandler(async (req: Request, res: Response) => {
  const post = await wasteService.updateWastePost(req.user!.id, req.params.id, req.body);
  res.json({ success: true, data: post });
});

/**
 * DELETE /api/v1/waste/:id
 * Deletes a waste post (FARMER only, own post, AVAILABLE only).
 */
export const deleteWaste = asyncHandler(async (req: Request, res: Response) => {
  const result = await wasteService.deleteWastePost(req.user!.id, req.params.id);
  res.json({ success: true, ...result });
});
