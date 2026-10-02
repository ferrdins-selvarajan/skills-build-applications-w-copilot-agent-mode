import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Activity, activityTypes } from '../models/Activity.js';
import { Leaderboard } from '../models/Leaderboard.js';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { Workout } from '../models/Workout.js';
import {
  authenticate,
  createAccessToken,
  validateJwtConfiguration,
} from '../middleware/authenticate.js';

export const apiRouter = Router();

const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validDifficulties = ['beginner', 'intermediate', 'advanced'] as const;
type ActivityType = (typeof activityTypes)[number];
type WorkoutDifficulty = (typeof validDifficulties)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isActivityType(value: unknown): value is ActivityType {
  return typeof value === 'string' && activityTypes.some((type) => type === value);
}

function isWorkoutDifficulty(value: unknown): value is WorkoutDifficulty {
  return typeof value === 'string' && validDifficulties.some((difficulty) => difficulty === value);
}

function sendError(response: Response, status: number, error: string) {
  response.status(status).json({ error });
}

apiRouter.post('/auth/register', async (request, response) => {
  const body: unknown = request.body;
  if (!isRecord(body) || !validString(body.name, 80) || !validString(body.email, 254) ||
      typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 128 ||
      !validEmail.test(body.email.trim())) {
    sendError(response, 400, 'Provide a name, valid email address, and password of 8 to 128 characters');
    return;
  }

  validateJwtConfiguration();
  const email = body.email.trim().toLowerCase();
  if (await User.exists({ email })) {
    sendError(response, 409, 'An account with that email already exists');
    return;
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await User.create({
    name: body.name.trim(),
    email,
    passwordHash,
    fitnessGoals: Array.isArray(body.fitnessGoals)
      ? body.fitnessGoals.filter((goal): goal is string => validString(goal, 60)).slice(0, 10)
      : [],
  });

  response.status(201).json({
    user,
    token: createAccessToken(user.id),
  });
});

apiRouter.post('/auth/login', async (request, response) => {
  const body: unknown = request.body;
  if (!isRecord(body) || typeof body.email !== 'string' || typeof body.password !== 'string') {
    sendError(response, 400, 'Provide an email address and password');
    return;
  }

  validateJwtConfiguration();
  const email = body.email.trim().toLowerCase();
  const password = body.password;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    sendError(response, 401, 'Invalid email or password');
    return;
  }

  response.json({
    user: await User.findById(user.id),
    token: createAccessToken(user.id),
  });
});

apiRouter.get('/users', async (_request, response) => {
  const users = await User.find()
    .select('name team')
    .populate('team', 'name')
    .sort({ name: 1 });
  response.json(users);
});

apiRouter.get('/users/me', authenticate, async (request, response) => {
  const userId = request.userId;
  if (!userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  const user = await User.findById(userId).populate('team', 'name description');
  if (!user) {
    sendError(response, 404, 'User not found');
    return;
  }
  response.json(user);
});

apiRouter.patch('/users/me', authenticate, async (request, response) => {
  const userId = request.userId;
  if (!userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  const body: unknown = request.body;
  if (!isRecord(body)) {
    sendError(response, 400, 'A profile object is required');
    return;
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) {
    if (!validString(body.name, 80)) {
      sendError(response, 400, 'Name must be between 1 and 80 characters');
      return;
    }
    updates.name = body.name.trim();
  }
  if (body.fitnessGoals !== undefined) {
    if (!Array.isArray(body.fitnessGoals) ||
        body.fitnessGoals.some((goal) => !validString(goal, 60)) ||
        body.fitnessGoals.length > 10) {
      sendError(response, 400, 'Fitness goals must be an array of up to 10 short strings');
      return;
    }
    updates.fitnessGoals = body.fitnessGoals.map((goal: string) => goal.trim());
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).populate('team', 'name description');
  if (!user) {
    sendError(response, 404, 'User not found');
    return;
  }
  response.json(user);
});

apiRouter.get('/teams', async (_request, response) => {
  const teams = await Team.find().populate('owner', 'name').populate('members', 'name');
  response.json(teams);
});

apiRouter.post('/teams', authenticate, async (request, response) => {
  const userId = request.userId;
  if (!userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  const body: unknown = request.body;
  if (!isRecord(body) || !validString(body.name, 60) ||
      (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 500))) {
    sendError(response, 400, 'Provide a team name and an optional description of up to 500 characters');
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    sendError(response, 404, 'User not found');
    return;
  }
  if (user.team) {
    sendError(response, 409, 'Leave your current team before creating or joining another team');
    return;
  }

  const team = await Team.create({
    name: body.name.trim(),
    description: typeof body.description === 'string' ? body.description.trim() : '',
    owner: userId,
    members: [userId],
  });
  user.team = team._id;
  await user.save();
  response.status(201).json(await team.populate('owner members', 'name'));
});

apiRouter.post('/teams/:id/join', authenticate, async (request, response) => {
  const userId = request.userId;
  if (!userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  if (!mongoose.isValidObjectId(request.params.id)) {
    sendError(response, 400, 'Invalid team ID');
    return;
  }
  const [user, team] = await Promise.all([
    User.findById(userId),
    Team.findById(request.params.id),
  ]);
  if (!user || !team) {
    sendError(response, 404, 'User or team not found');
    return;
  }
  if (user.team) {
    sendError(response, 409, 'Leave your current team before joining another team');
    return;
  }

  if (!team.members.some((member) => member.equals(user._id))) {
    team.members.push(user._id);
  }
  user.team = team._id;
  await Promise.all([team.save(), user.save()]);
  response.json(await team.populate('owner members', 'name'));
});

apiRouter.post('/teams/:id/leave', authenticate, async (request, response) => {
  const userId = request.userId;
  if (!userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  if (!mongoose.isValidObjectId(request.params.id)) {
    sendError(response, 400, 'Invalid team ID');
    return;
  }
  const team = await Team.findById(request.params.id);
  const user = await User.findById(userId);
  if (!team || !user || user.team?.toString() !== team.id) {
    sendError(response, 404, 'Team membership not found');
    return;
  }

  team.members = team.members.filter((member) => !member.equals(user._id));
  user.team = null;
  await Promise.all([team.save(), user.save()]);
  if (team.members.length === 0) {
    await team.deleteOne();
    response.json({ message: 'You left the team; the empty team was removed' });
    return;
  }
  if (team.owner.equals(user._id)) {
    team.owner = team.members[0]!;
    await team.save();
  }
  response.json(await team.populate('owner members', 'name'));
});

apiRouter.get('/activities', authenticate, async (request, response) => {
  const userId = request.userId;
  if (!userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  const activities = await Activity.find({ user: userId }).sort({ date: -1 });
  response.json(activities);
});

apiRouter.post('/activities', authenticate, async (request, response) => {
  const userId = request.userId;
  if (!userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  const body: unknown = request.body;
  if (!isRecord(body) || !isActivityType(body.type) ||
      typeof body.durationMinutes !== 'number' || !Number.isFinite(body.durationMinutes) ||
      body.durationMinutes < 1 || body.durationMinutes > 1440 ||
      (body.distanceKm !== undefined &&
        (typeof body.distanceKm !== 'number' || !Number.isFinite(body.distanceKm) ||
          body.distanceKm < 0 || body.distanceKm > 1000)) ||
      (body.notes !== undefined && (typeof body.notes !== 'string' || body.notes.length > 500))) {
    sendError(response, 400, 'Provide a valid activity type, duration, distance, and notes');
    return;
  }
  const date = body.date === undefined ? new Date() : new Date(String(body.date));
  if (Number.isNaN(date.getTime()) || date.getTime() > Date.now() + 60_000) {
    sendError(response, 400, 'Activity date must be a valid date and cannot be in the future');
    return;
  }
  const points = Math.max(1, Math.round(body.durationMinutes + (body.distanceKm ?? 0) * 10));
  const activity = await Activity.create({
    user: userId,
    type: body.type,
    durationMinutes: body.durationMinutes,
    distanceKm: body.distanceKm ?? 0,
    date,
    notes: body.notes?.trim() ?? '',
    points,
  });
  await Leaderboard.findOneAndUpdate(
    { user: userId },
    { $inc: { points, activitiesCount: 1 }, $setOnInsert: { user: userId } },
    { upsert: true, new: true, runValidators: true },
  );
  response.status(201).json(activity);
});

apiRouter.delete('/activities/:id', authenticate, async (request, response) => {
  const userId = request.userId;
  if (!userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  if (!mongoose.isValidObjectId(request.params.id)) {
    sendError(response, 400, 'Invalid activity ID');
    return;
  }
  const activity = await Activity.findOneAndDelete({
    _id: request.params.id,
    user: userId,
  });
  if (!activity) {
    sendError(response, 404, 'Activity not found');
    return;
  }
  const entry = await Leaderboard.findOneAndUpdate(
    { user: userId },
    { $inc: { points: -activity.points, activitiesCount: -1 } },
    { new: true },
  );
  if (entry && entry.activitiesCount <= 0) {
    await entry.deleteOne();
  }
  response.status(204).end();
});

apiRouter.get('/leaderboard', async (_request, response) => {
  const leaderboard = await Leaderboard.find({ activitiesCount: { $gt: 0 } })
    .sort({ points: -1, updatedAt: 1 })
    .limit(100)
    .populate('user', 'name team')
    .lean();
  response.json(leaderboard);
});

apiRouter.get('/workouts', async (_request, response) => {
  response.json(await Workout.find().sort({ activityType: 1, difficulty: 1 }));
});

apiRouter.get('/workouts/recommended', authenticate, async (request, response) => {
  const userId = request.userId;
  if (!userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  const [user, recentActivities] = await Promise.all([
    User.findById(userId),
    Activity.find({ user: userId }).sort({ date: -1 }).limit(5),
  ]);
  if (!user) {
    sendError(response, 404, 'User not found');
    return;
  }

  const recentTypes = new Set(recentActivities.map((activity) => activity.type));
  const workouts = await Workout.find();
  const recommended = workouts
    .map((workout) => ({
      workout,
      score:
        (recentTypes.has(workout.activityType) ? 2 : 0) +
        (user.fitnessGoals.some((goal) =>
          workout.tags.some((tag) => goal.toLowerCase().includes(tag)),
        ) ? 1 : 0),
    }))
    .sort((left, right) => right.score - left.score || left.workout.title.localeCompare(right.workout.title))
    .slice(0, 10)
    .map(({ workout }) => workout);
  response.json(recommended);
});

apiRouter.post('/workouts', authenticate, async (request, response) => {
  if (!request.userId) {
    sendError(response, 401, 'Authentication is required');
    return;
  }
  const body: unknown = request.body;
  if (!isRecord(body) || !validString(body.title, 100) ||
      !validString(body.description, 1000) ||
      !isActivityType(body.activityType) ||
      !isWorkoutDifficulty(body.difficulty) ||
      typeof body.durationMinutes !== 'number' || !Number.isInteger(body.durationMinutes) ||
      body.durationMinutes < 1 || body.durationMinutes > 1440 ||
      (body.tags !== undefined && (!Array.isArray(body.tags) ||
        body.tags.some((tag) => !validString(tag, 40)) || body.tags.length > 20))) {
    sendError(response, 400, 'Provide a valid workout title, description, activity type, difficulty, duration, and tags');
    return;
  }
  const workout = await Workout.create({
    title: body.title.trim(),
    description: body.description.trim(),
    activityType: body.activityType,
    difficulty: body.difficulty,
    durationMinutes: body.durationMinutes,
    tags: body.tags?.map((tag: string) => tag.trim().toLowerCase()) ?? [],
  });
  response.status(201).json(workout);
});
