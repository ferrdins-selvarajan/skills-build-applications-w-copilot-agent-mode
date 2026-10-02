import mongoose, { Schema } from 'mongoose';
import { activityTypes } from './Activity.js';

const workoutSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    activityType: { type: String, enum: activityTypes, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
  },
  { timestamps: true },
);

export const Workout = mongoose.model('Workout', workoutSchema);
