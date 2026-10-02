import mongoose, { Schema } from 'mongoose';

export const activityTypes = [
  'walking',
  'running',
  'cycling',
  'swimming',
  'strength',
] as const;

const activitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: activityTypes, required: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
    distanceKm: { type: Number, min: 0, max: 1000, default: 0 },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    points: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

export const Activity = mongoose.model('Activity', activitySchema);
