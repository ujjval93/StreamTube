import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access And Refresh Tokens"
    );
  }
};

//register user
const registerUser = asyncHandler(async (req, res) => {
  //steps of resisterUser
  // get user datail from frontend
  // validate user datail -> not empty, email is valid, password is strong
  // check if user already exist in database: username or email
  // chack for image , check for avarar image
  // upload them to cloudinary and get the url
  // create user object - create entry in database(db)
  // remove password and refreshToken field from response
  // check for user created successfully or not and send response to frontend
  // return res.status

  //how to take user detail, 1. req.body agar form se aa rhe he or json,  2. url,
  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);

  //aise condn laga ke bari bari sab me check kr sakte ho -> m-2, 2 line me ho jayega
  // if(fullname === ""){ throw new ApiError(400, "fullname is required") }
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //validatation
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLacalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  //check avatar
  if (!avatarLacalPath) {
    throw new ApiError(400, "avatar file is required");
  }

  //upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLacalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //check avatar is uplaoded or not
  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }

  //entry on database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    //if cover img url is present then pass url nhi to ""
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

//Login user
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

//logout User
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired");
    }

    const options = { httpOnly: true, secure: true };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiError(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.massage || "Invalid Refresh Token");
  }
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
})


const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, req.user, "current user fetched successfully")
})


const updateAccountDetails = asyncHandler(async (req, res) => {
  const {fullName, email} = req.body

  if(!fullName || !email){
    throw new ApiError(400, "All fields are required")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email
      }
    },
    {new: true}
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200, user, "Account details updates successfully")
  )
})


const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLacalPath = req.file?.path

  if(!avatarLacalPath){
    throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLacalPath)

  if(!avatar.url){
    throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new: true}
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200, user, "cover image updated successfully")
  )

})


const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLacalPath = req.file?.path

  if(!coverImageLacalPath){
    throw new ApiError(400, "cover image file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLacalPath)

  if(!coverImage.url){
    throw new ApiError(400, "Error while uploading on coverImage")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200, user, "cover image updated successfully")
  )

})

export { 
  registerUser, 
  loginUser,
  logoutUser, 
  refreshAccessToken, 
  changeCurrentPassword, 
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};
