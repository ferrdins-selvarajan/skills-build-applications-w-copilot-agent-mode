import mongoose, { Schema } from 'mongoose';

const leaderboardSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true, min: 0, default: 0 },
    activitiesCount: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

leaderboardSchema.index({ user: 1 }, { unique: true });
leaderboardSchema.index({ points: -1, updatedAt: 1 });

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
