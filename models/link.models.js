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
        Mobile: { type: Number, default: 0 },
        Tablet: { type: Number, default: 0 },
        Desktop: { type: Number, default: 0 },
      },
    },
  },

  { timestamps: true }
);

const Link = mongoose.model("Link", linkSchema);

module.exports = Link;
