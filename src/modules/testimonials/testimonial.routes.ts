import { Router } from 'express';
import {
  listTestimonialsController,
  getTestimonialController,
  createTestimonialController,
  updateTestimonialController,
  deleteTestimonialController,
} from './testimonial.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

export const testimonialRouter = Router();

// Public — storefront reads active testimonials
testimonialRouter.get('/', listTestimonialsController);

// Admin — full CRUD
testimonialRouter.get('/:id',    requireAuth, requireAdmin, getTestimonialController);
testimonialRouter.post('/',      requireAuth, requireAdmin, createTestimonialController);
testimonialRouter.put('/:id',    requireAuth, requireAdmin, updateTestimonialController);
testimonialRouter.delete('/:id', requireAuth, requireAdmin, deleteTestimonialController);
