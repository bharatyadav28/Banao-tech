import { StatusCodes } from "http-status-codes";
import crypto from "crypto";

import UserModel from "../models/User.js";

import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../errors/index.js";
import {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} from "../utils/index.js";

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const verificationToken = crypto.randomBytes(40).toString("hex");
  const user = await UserModel.create({
    name,
    email,
    password,
    verificationToken,
  });

  //  There a proxy between client and server
  let clientProtocol = req.get("x-forwarded-proto");
  let clientHost = req.get("x-forwarded-host");

  if (clientProtocol === "http") {
    clientHost = "localhost:3000";
  }
  if (clientProtocol === "https") {
    clientHost = "";
  }

  const origin = `${clientProtocol}://${clientHost}`;

  // console.log("hp", clientProtocol, clientHost, req.get("host"));

  await sendVerificationEmail({ name, email, origin, verificationToken });

  res.status(StatusCodes.CREATED).json({
    msg: "Please check your email for verification ",
  });
};

const verifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;

  if (!email || !verificationToken) {
    throw new BadRequestError("Please provide email and token");
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError("Verfication token is incorrect");
  }
  user.verificationToken = "";
  user.isVerified = true;
  user.verified = new Date(Date.now());

  user.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: "Verification of email is successfull" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please enter email and password");
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new BadRequestError(`No user with email ${email}`);
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Wrong email or password");
  }

  if (!user.isVerified) {
    throw new UnauthenticatedError("Please verify your email");
  }

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, tokenUser });

  return res
    .status(StatusCodes.OK)
    .json({ msg: "Login Successfull", user: { name: user.name } });
};

//create new token

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "Logout user" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError("Please provide email.");
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new NotFoundError(`No user with email ${email}`);
  }

  const passwordToken = crypto.randomBytes(70).toString("hex");

  let clientProtocol = req.get("x-forwarded-proto");
  let clientHost = req.get("x-forwarded-host");
  // console.log(clientProtocol, clientHost);

  if (clientProtocol === "http") {
    clientHost = "localhost:3000";
  }
  if (clientProtocol === "https") {
    clientHost = "";
  }

  const origin = `${clientProtocol}://${clientHost}`;
  await sendResetPasswordEmail({
    name: user.name,
    email,
    origin,
    passwordToken,
  });

  const tenMinutes = 1000 * 60 * 10;
  const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

  user.passwordToken = createHash(passwordToken);
  user.passwordTokenExpirationDate = passwordTokenExpirationDate;
  user.save();

  return res.status(StatusCodes.OK).json({
    msg: "Please check your email for reset password link.",
  });
};

const resetPasword = async (req, res) => {
  const { email, password, passwordToken } = req.body;

  if (!email || !password || !passwordToken) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await UserModel.findOne({
    email,
    passwordToken: createHash(passwordToken),
  });
  if (!user) {
    throw new NotFoundError(`Invalid token`);
  }

  const now = new Date(Date.now());

  if (user.passwordTokenExpirationDate <= now) {
    throw new BadRequestError("Link expired");
  }

  user.passwordToken = null;
  user.passwordTokenExpirationDate = null;
  user.password = password;
  await user.save();

  return res
    .status(StatusCodes.OK)
    .json({ msg: "Password reset successfully" });
};

export { register, verifyEmail, login, logout, forgotPassword, resetPasword };
