import { UnAuthorizedError } from "../errors/index.js";

const checkPostPermissions = ({ authUser, resourceUser }) => {
  if (authUser === resourceUser.toString()) {
    return;
  }
  throw new UnAuthorizedError("You are not authorised to access this page.");
};

const checkReviewPermission = ({ authUser, postUser, commentUser }) => {
  if (authUser === postUser.toString() || authUser === commentUser.toString()) {
    return;
  }
  throw new UnAuthorizedError("You are not authorised to access this page.");
};

export { checkPostPermissions, checkReviewPermission };
