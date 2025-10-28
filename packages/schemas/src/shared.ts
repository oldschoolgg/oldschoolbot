import z from 'zod';

export const PosInt = z.number().int().positive();
