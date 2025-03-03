const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    url: {
      type: String,
    },
    expiry: {
      type: Boolean,
      default: false,
    },
    socialMedia: {
      type: String,
      enum: ["insta", "yt", "fb", "x"],
    },
    type: {
      type: String,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    clickData: {
      monthlyClicks: {
        type: Map,
        of: Number,
        default: {},
      },
      deviceClicks: {
        Linux: { type: Number, default: 0 },
        Mac: { type: Number, default: 0 },
        iOS: { type: Number, default: 0 },
        Windows: { type: Number, default: 0 },
        Android: { type: Number, default: 0 },
        Other: { type: Number, default: 0 },
      },
    },
  },

  { timestamps: true }
);

const Link = mongoose.model("Link", linkSchema);

module.exports = Link;
