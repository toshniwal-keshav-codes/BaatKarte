import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 200 },
    lastSeenAt: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true },
);

UserSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    name: this.name,
    username: this.username,
    email: this.email,
    avatarUrl: this.avatarUrl,
    bio: this.bio,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", UserSchema);