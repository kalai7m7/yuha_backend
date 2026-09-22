import { Request, Response } from 'express';
import {
  getTestimonials,
  getTestimonial,
  addTestimonial,
  editTestimonial,
  removeTestimonial,
} from './testimonial.service';
import { CreateTestimonialInput, UpdateTestimonialInput } from './testimonial.repository';

export async function listTestimonialsController(req: Request, res: Response) {
  // Public route: only active. Admin route: all.
  const activeOnly = req.query.active_only !== 'false' && !req.userRole;
  const data = await getTestimonials(activeOnly);
  res.json({ success: true, data });
}

export async function getTestimonialController(req: Request, res: Response) {
  const data = await getTestimonial(req.params.id);
  res.json({ success: true, data });
}

export async function createTestimonialController(req: Request, res: Response) {
  const body = req.body;
  const input: CreateTestimonialInput = {
    name: body.name,
    city: body.city,
    product: body.product,
    review: body.review,
    initials: body.initials,
    avatar_class: body.avatar_class,
    sort_order: body.sort_order !== undefined ? Number(body.sort_order) : undefined,
    is_active: body.is_active !== undefined ? (body.is_active === 'true' || body.is_active === true) : true,
  };
  const data = await addTestimonial(input);
  res.status(201).json({ success: true, data });
}

export async function updateTestimonialController(req: Request, res: Response) {
  const body = req.body;
  const input: UpdateTestimonialInput = {
    ...(body.name !== undefined      && { name: body.name }),
    ...(body.city !== undefined      && { city: body.city }),
    ...(body.product !== undefined   && { product: body.product }),
    ...(body.review !== undefined    && { review: body.review }),
    ...(body.initials !== undefined  && { initials: body.initials }),
    ...(body.avatar_class !== undefined && { avatar_class: body.avatar_class }),
    ...(body.sort_order !== undefined   && { sort_order: Number(body.sort_order) }),
    ...(body.is_active !== undefined    && { is_active: body.is_active === 'true' || body.is_active === true }),
  };
  const data = await editTestimonial(req.params.id, input);
  res.json({ success: true, data });
}

export async function deleteTestimonialController(req: Request, res: Response) {
  await removeTestimonial(req.params.id);
  res.json({ success: true, data: null });
}
