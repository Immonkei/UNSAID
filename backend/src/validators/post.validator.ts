import { z } from 'zod';

export const VALID_CATEGORIES = [
  'Love',
  'Heartbreak',
  'Life',
  'Family',
  'Friendship',
  'Overthinking',
  'Motivation',
  'Regret',
  'Letting Go',
  'Other',
] as const;

export type Category = (typeof VALID_CATEGORIES)[number];

// Regular expressions to detect phone numbers and emails to guard privacy
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

export const createPostSchema = z.object({
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(3, { message: 'Thought must be at least 3 characters long' })
    .max(2000, { message: 'Thought cannot exceed 2,000 characters' })
    .refine((val) => !EMAIL_REGEX.test(val), {
      message: 'For your privacy and safety, please do not include email addresses in your submission',
    })
    .refine((val) => !PHONE_REGEX.test(val), {
      message: 'For your privacy and safety, please do not include phone numbers in your submission',
    }),
  category: z.enum(VALID_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  imageUrl: z.string().optional().nullable(),
  agreeToRules: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must agree to the community rules to submit',
    }),
});

export const reportPostSchema = z.object({
  reason: z.enum(
    ['Spam', 'Harassment', 'Hate speech', 'Sexual content', 'Personal information', 'Threat', 'Other'],
    {
      errorMap: () => ({ message: 'Please select a valid report reason' }),
    }
  ),
});

export const likePostSchema = z.object({
  // Fingerprint or random UUID stored in localStorage to prevent duplicate likes
  anonymousIdentifier: z.string().min(10).max(128).optional(),
});
