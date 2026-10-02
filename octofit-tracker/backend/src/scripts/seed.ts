import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Activity } from '../models/Activity.js';
import { Leaderboard } from '../models/Leaderboard.js';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { Workout } from '../models/Workout.js';

const connectionString =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

const workoutPlans = [
  {
    title: 'Steady Start Walk',
    description: 'A comfortable-paced walk to build a consistent movement habit.',
    activityType: 'walking',
    difficulty: 'beginner',
    durationMinutes: 25,
    tags: ['beginner', 'consistency', 'cardio'],
  },
  {
    title: 'Easy Run Intervals',
    description: 'Alternate relaxed running and walking to build endurance.',
    activityType: 'running',
    difficulty: 'beginner',
    durationMinutes: 30,
    tags: ['beginner', 'endurance', 'cardio'],
  },
  {
    title: 'Tempo Run',
    description: 'A focused tempo session with a warm-up and cool-down.',
    activityType: 'running',
    difficulty: 'intermediate',
    durationMinutes: 40,
    tags: ['endurance', 'speed', 'cardio'],
  },
  {
    title: 'Foundations Strength',
    description: 'A full-body bodyweight circuit emphasizing controlled form.',
    activityType: 'strength',
    difficulty: 'beginner',
    durationMinutes: 30,
    tags: ['beginner', 'strength', 'full body'],
  },
  {
    title: 'Power Ride',
    description: 'A progressive cycling workout with short efforts and recovery.',
    activityType: 'cycling',
    difficulty: 'intermediate',
    durationMinutes: 45,
    tags: ['endurance', 'strength', 'cardio'],
  },
  {
    title: 'Swim Technique Session',
    description: 'An easy swim focused on smooth, efficient technique.',
    activityType: 'swimming',
    difficulty: 'beginner',
    durationMinutes: 35,
    tags: ['beginner', 'technique', 'endurance'],
  },
];

const demoUsers = [
  {
    name: 'Jordan Lee',
    email: 'jordan.lee@example.test',
    fitnessGoals: ['endurance', 'cardio'],
    teamName: 'Trailblazers',
  },
  {
    name: 'Sam Rivera',
    email: 'sam.rivera@example.test',
    fitnessGoals: ['strength', 'consistency'],
    teamName: 'Trailblazers',
  },
  {
    name: 'Morgan Chen',
    email: 'morgan.chen@example.test',
    fitnessGoals: ['swimming', 'endurance'],
    teamName: 'Fit Collective',
  },
  {
    name: 'Taylor Brooks',
    email: 'taylor.brooks@example.test',
    fitnessGoals: ['cycling', 'cardio'],
    teamName: 'Fit Collective',
  },
];

const demoTeams = [
  {
    name: 'Trailblazers',
    description: 'A friendly crew building endurance one activity at a time.',
    ownerEmail: 'jordan.lee@example.test',
    memberEmails: ['jordan.lee@example.test', 'sam.rivera@example.test'],
  },
  {
    name: 'Fit Collective',
    description: 'A supportive team for balanced, consistent training.',
    ownerEmail: 'morgan.chen@example.test',
    memberEmails: ['morgan.chen@example.test', 'taylor.brooks@example.test'],
  },
];

const demoActivities = [
  {
    email: 'jordan.lee@example.test',
    type: 'running',
    durationMinutes: 32,
    distanceKm: 4.2,
    date: new Date('2026-09-30T08:00:00.000Z'),
    notes: 'Easy morning run',
    points: 74,
  },
  {
    email: 'jordan.lee@example.test',
    type: 'cycling',
    durationMinutes: 50,
    distanceKm: 18,
    date: new Date('2026-10-01T07:30:00.000Z'),
    notes: 'Steady team ride',
    points: 230,
  },
  {
    email: 'sam.rivera@example.test',
    type: 'walking',
    durationMinutes: 42,
    distanceKm: 3.5,
    date: new Date('2026-09-30T17:15:00.000Z'),
    notes: 'Evening neighborhood walk',
    points: 77,
  },
  {
    email: 'sam.rivera@example.test',
    type: 'strength',
    durationMinutes: 35,
    distanceKm: 0,
    date: new Date('2026-10-01T18:00:00.000Z'),
    notes: 'Full-body strength session',
    points: 35,
  },
  {
    email: 'morgan.chen@example.test',
    type: 'swimming',
    durationMinutes: 40,
    distanceKm: 1.5,
    date: new Date('2026-09-29T09:00:00.000Z'),
    notes: 'Technique-focused swim',
    points: 55,
  },
  {
    email: 'morgan.chen@example.test',
    type: 'running',
    durationMinutes: 25,
    distanceKm: 3,
    date: new Date('2026-10-01T07:45:00.000Z'),
    notes: 'Short recovery run',
    points: 55,
  },
  {
    email: 'taylor.brooks@example.test',
    type: 'cycling',
    durationMinutes: 45,
    distanceKm: 15,
    date: new Date('2026-09-30T06:45:00.000Z'),
    notes: 'Progressive cycling session',
    points: 195,
  },
  {
    email: 'taylor.brooks@example.test',
    type: 'walking',
    durationMinutes: 30,
    distanceKm: 2.5,
    date: new Date('2026-10-01T16:30:00.000Z'),
    notes: 'Recovery walk',
    points: 55,
  },
];

async function seedDatabase(): Promise<void> {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to octofit_db');

    const demoPassword = process.env.SEED_DEMO_PASSWORD;
    if (demoPassword !== undefined && demoPassword.length < 12) {
      throw new Error('SEED_DEMO_PASSWORD must be at least 12 characters');
    }

    for (const workout of workoutPlans) {
      await Workout.updateOne(
        { title: workout.title },
        { $setOnInsert: workout },
        { upsert: true },
      );
    }

    const passwordHashes = await Promise.all(
      demoUsers.map((user) =>
        bcrypt.hash(demoPassword ?? randomBytes(32).toString('hex'), 12),
      ),
    );
    const usersByEmail = new Map<string, InstanceType<typeof User>>();
    for (const [index, demoUser] of demoUsers.entries()) {
      const user = await User.findOneAndUpdate(
        { email: demoUser.email },
        {
          $set: {
            name: demoUser.name,
            fitnessGoals: demoUser.fitnessGoals,
          },
          $setOnInsert: { passwordHash: passwordHashes[index] },
        },
        { upsert: true, returnDocument: 'after', runValidators: true },
      );
      if (!user) {
        throw new Error(`Unable to seed demo user ${demoUser.email}`);
      }
      usersByEmail.set(demoUser.email, user);
    }

    const teamsByName = new Map<string, InstanceType<typeof Team>>();
    for (const demoTeam of demoTeams) {
      const owner = usersByEmail.get(demoTeam.ownerEmail);
      const members = demoTeam.memberEmails.map((email) => usersByEmail.get(email));
      if (!owner || members.some((member) => !member)) {
        throw new Error(`Unable to resolve members for demo team ${demoTeam.name}`);
      }
      const team = await Team.findOneAndUpdate(
        { name: demoTeam.name },
        {
          $set: {
            description: demoTeam.description,
            owner: owner._id,
            members: members.map((member) => member!._id),
          },
        },
        { upsert: true, returnDocument: 'after', runValidators: true },
      );
      if (!team) {
        throw new Error(`Unable to seed demo team ${demoTeam.name}`);
      }
      teamsByName.set(demoTeam.name, team);
    }

    for (const demoUser of demoUsers) {
      const user = usersByEmail.get(demoUser.email);
      const team = teamsByName.get(demoUser.teamName);
      if (!user || !team) {
        throw new Error(`Unable to assign ${demoUser.email} to a demo team`);
      }
      user.team = team._id;
      await user.save();
    }

    for (const demoActivity of demoActivities) {
      const user = usersByEmail.get(demoActivity.email);
      if (!user) {
        throw new Error(`Unable to find activity owner ${demoActivity.email}`);
      }
      const activityId = new mongoose.Types.ObjectId(
        createHash('sha256')
          .update(`${demoActivity.email}:${demoActivity.type}:${demoActivity.date.toISOString()}`)
          .digest('hex')
          .slice(0, 24),
      );
      const activityData = {
        _id: activityId,
        user: user._id,
        type: demoActivity.type,
        durationMinutes: demoActivity.durationMinutes,
        distanceKm: demoActivity.distanceKm,
        date: demoActivity.date,
        notes: demoActivity.notes,
        points: demoActivity.points,
      };
      await Activity.findByIdAndUpdate(
        activityId,
        { $setOnInsert: activityData },
        { upsert: true, returnDocument: 'after', runValidators: true },
      );
    }

    const leaderboardRows = await Activity.aggregate<{
      _id: mongoose.Types.ObjectId;
      points: number;
      activitiesCount: number;
    }>([
      {
        $group: {
          _id: '$user',
          points: { $sum: '$points' },
          activitiesCount: { $sum: 1 },
        },
      },
    ]);

    if (leaderboardRows.length > 0) {
      await Leaderboard.bulkWrite(
        leaderboardRows.map((row) => ({
          updateOne: {
            filter: { user: row._id },
            update: {
              $set: { points: row.points, activitiesCount: row.activitiesCount },
            },
            upsert: true,
          },
        })),
      );
      await Leaderboard.deleteMany({
        user: { $nin: leaderboardRows.map((row) => row._id) },
      });
    }

    console.log(
      `Database seeding complete: ${demoUsers.length} users, ${demoTeams.length} teams, ` +
        `${demoActivities.length} activities, ${leaderboardRows.length} leaderboard entries, ` +
        `${workoutPlans.length} workout plans`,
    );
    if (!demoPassword) {
      console.log(
        'Demo accounts were created with random, undisclosed passwords; they are for display/testing data, not login.',
      );
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedDatabase();
