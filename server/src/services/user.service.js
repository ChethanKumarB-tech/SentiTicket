const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Session = require('../models/Session');
const AppError = require('../utils/appError');
const { hashPassword } = require('../utils/token.utils');

async function listUsers(organizationId, { page = 1, limit = 20, role, status, search }) {
  const filter = { organizationId };

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    filter.$or = [
      { firstName: { $regex: escapedSearch, $options: 'i' } },
      { lastName: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function createUserByAdmin(organizationId, { email, firstName, lastName, role, password }, actor, ipAddress) {
  const existing = await User.findOne({ organizationId, email });
  if (existing) {
    throw AppError.conflict('A user with this email address already exists in this organization');
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    organizationId,
    email,
    firstName,
    lastName,
    role,
    passwordHash: hashedPassword,
    status: 'ACTIVE',
    emailVerified: true
  });

  await AuditLog.create({
    organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'USER_PROVISIONED',
    resourceType: 'USER',
    resourceId: user._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { email: user.email, role: user.role }
  });

  return user;
}

async function getUserById(organizationId, userId) {
  const user = await User.findOne({ _id: userId, organizationId });
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user;
}

async function updateUserProfile(userId, { firstName, lastName }) {
  const updates = {};
  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;

  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user;
}

async function changeUserRole(organizationId, userId, newRole, actor, ipAddress) {
  if (actor._id.toString() === userId.toString()) {
    throw AppError.badRequest('You cannot modify your own role to prevent accidental lockout', 'SELF_ROLE_CHANGE_BLOCKED');
  }

  const user = await User.findOne({ _id: userId, organizationId });
  if (!user) {
    throw AppError.notFound('User not found');
  }

  const previousRole = user.role;
  user.role = newRole;
  user.tokenVersion += 1;
  await user.save();

  await AuditLog.create({
    organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'USER_ROLE_CHANGED',
    resourceType: 'USER',
    resourceId: user._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { userId, previousRole, newRole }
  });

  return user;
}

async function changeUserStatus(organizationId, userId, newStatus, actor, ipAddress) {
  if (actor._id.toString() === userId.toString() && newStatus !== 'ACTIVE') {
    throw AppError.badRequest('You cannot suspend or lock your own account', 'SELF_STATUS_CHANGE_BLOCKED');
  }

  const user = await User.findOne({ _id: userId, organizationId });
  if (!user) {
    throw AppError.notFound('User not found');
  }

  user.status = newStatus;
  if (newStatus !== 'ACTIVE') {
    user.tokenVersion += 1;
    await Session.updateMany({ userId: user._id }, { isRevoked: true });
  }
  await user.save();

  await AuditLog.create({
    organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'USER_STATUS_CHANGED',
    resourceType: 'USER',
    resourceId: user._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { userId, newStatus }
  });

  return user;
}

module.exports = {
  listUsers,
  createUserByAdmin,
  getUserById,
  updateUserProfile,
  changeUserRole,
  changeUserStatus
};
