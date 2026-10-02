import mongoose, { Schema } from 'mongoose';

interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  team: mongoose.Types.ObjectId | null;
  fitnessGoals: string[];
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    team: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    fitnessGoals: [{ type: String, trim: true, maxlength: 60 }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, result) => {
        return Object.fromEntries(
          Object.entries(result).filter(([key]) => key !== 'passwordHash'),
        );
      },
    },
  },
);

export const User = mongoose.model('User', userSchema);
