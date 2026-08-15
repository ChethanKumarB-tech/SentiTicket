const userService = require('../services/user.service');

async function listUsers(req, res, next) {
  try {
    const result = await userService.listUsers(req.user.organizationId, req.query);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const user = await userService.createUserByAdmin(req.user.organizationId, req.body, req.user, req.ip);
    return res.status(201).json({
      success: true,
      message: 'User provisioned successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.organizationId, req.params.id);
    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateUserProfile(req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

async function changeRole(req, res, next) {
  try {
    const user = await userService.changeUserRole(req.user.organizationId, req.params.id, req.body.role, req.user, req.ip);
    return res.status(200).json({
      success: true,
      message: `User role successfully changed to ${req.body.role}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

async function changeStatus(req, res, next) {
  try {
    const user = await userService.changeUserStatus(req.user.organizationId, req.params.id, req.body.status, req.user, req.ip);
    return res.status(200).json({
      success: true,
      message: `User status updated to ${req.body.status}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  createUser,
  getUser,
  updateProfile,
  changeRole,
  changeStatus
};
