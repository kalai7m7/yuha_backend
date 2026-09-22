import {
  listTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from './testimonial.repository';

export const getTestimonials = (activeOnly = false) => listTestimonials(activeOnly);
export const getTestimonial = (id: string) => getTestimonialById(id);
export const addTestimonial = (input: CreateTestimonialInput) => createTestimonial(input);
export const editTestimonial = (id: string, input: UpdateTestimonialInput) => updateTestimonial(id, input);
export const removeTestimonial = (id: string) => deleteTestimonial(id);
