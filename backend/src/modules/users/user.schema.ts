import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    userId: string;
    email: string;
    password: string;
    active: boolean;
    referralCode?: string;
    referrer?: string | null;
    emailToken?: string | null;
    emailTokenExpires?: Date | null;
    resetPasswordToken?: string | null;   // ✅ add
    resetPasswordExpires?: Date | null;
    accessToken: string | null;
}

export interface IUserModel extends Model<IUser> {
    hashPassword(password: string): Promise<string>;
    comparePassword(
        inputPassword: string,
        hashedPassword: string
    ): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        userId: { type: String, unique: true, required: true },
        email: { type: String, required: true, unique: true },
        active: { type: Boolean, default: false },
        password: { type: String, required: true },
        referralCode: { type: String, unique: true },
        referrer: { type: String, default: null },
        emailToken: { type: String, default: null },
        emailTokenExpires: { type: Date, default: null },
        accessToken: { type: String, default: null }
    },
    { timestamps: true }
);


userSchema.statics.hashPassword = async function (password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

userSchema.statics.comparePassword = async function (
    inputPassword: string,
    hashedPassword: string
) {
    return bcrypt.compare(inputPassword, hashedPassword);
};


const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;

