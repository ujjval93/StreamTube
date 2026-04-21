import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access And Refresh Tokens")
    }
}


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
    const {fullName, email, username, password} = req.body
    console.log("email: ", email);

    //aise condn laga ke bari bari sab me check kr sakte ho -> m-2, 2 line me ho jayega
    // if(fullname === ""){ throw new ApiError(400, "fullname is required") }
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    //validatation
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLacalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
   
    //check avatar
    if(!avatarLacalPath){
        throw new ApiError(400, "avatar file is required")
    }


    //upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLacalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //check avatar is uplaoded or not
    if(!avatar){
        throw new ApiError(400, "avatar file is required")
    }

    //entry on database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        //if cover img url is present then pass url nhi to ""
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully") 
    )
})


//Login user
const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})


//logout User
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


export {registerUser, loginUser, logoutUser}