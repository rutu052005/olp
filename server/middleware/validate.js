import { z } from 'zod';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors ? err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) : err.message
      });
    }
  };
};

export const registerSchema = z.zod ? z.object : z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  role: z.enum(['student', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const courseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional(),
  category: z.string().min(2, { message: 'Category is required' }),
  level: z.enum(['School', 'Diploma', 'Degree', 'Masters']).optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  price: z.number().nonnegative().optional(),
  thumbnail_url: z.string().url().optional().or(z.string().length(0)),
  instructor_name: z.string().min(2, { message: 'Instructor name is required' }),
  duration_hours: z.number().positive().optional(),
  outcomes: z.array(z.string()).optional(),
  language: z.string().optional(),
});

export const submitAssessmentSchema = z.object({
  answers: z.record(z.union([z.string(), z.number()])),
});
