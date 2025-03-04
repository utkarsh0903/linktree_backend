const express = require("express");
const Link = require("../models/link.models");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");

router.post("/add-links", authMiddleware, async (req, res) => {
  try {
    const { title, url, expiry, type, socialMedia } = req.body;

    if (!title || !url || !socialMedia || !type) {
      return res
        .status(400)
        .json({ message: "Title, URL, Type and Social Media are required." });
    }

    const newLink = new Link({
      user: req.user.id,
      title,
      url,
      expiry,
      type,
      socialMedia,
    });

    await newLink.save();

    return res.status(201).json({ message: "Link added successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/get-links", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const links = await Link.find({ user: userId });

    return res.status(200).json({ links });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const {id} = req.params;
  try {
    const links = await Link.find({user : id});
    if (!links) {
      return res.status(400).json({ message: "Links not found" });
    }
    return res.status(200).json(links);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:id/click", async (req, res) => {
  try {
    const { id } = req.params;
    const usertype = req.headers["user-agent"];

    const getDeviceType = (usertype) => {
      if (/windows/i.test(usertype)) return "Windows";
      if (/mac/i.test(usertype)) return "Mac";
      if (/linux/i.test(usertype)) return "Linux";
      if (/android/i.test(usertype)) return "Android";
      if (/iphone|ipad|ipod/i.test(usertype)) return "iOS";
      return "Other";
    };

    const deviceType = getDeviceType(usertype);
    const currentMonth = new Date().toLocaleString("default", {
      month: "short",
    });

    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    link.clicks += 1;

    if (link.clickData.monthlyClicks.has(currentMonth)) {
      link.clickData.monthlyClicks.set(
        currentMonth,
        link.clickData.monthlyClicks.get(currentMonth) + 1
      );
    } else {
      link.clickData.monthlyClicks.set(currentMonth, 1);
    }

    link.clickData.deviceClicks[deviceType] += 1;

    await link.save();

    res.status(200).json({ message: "Click counted" });
  } catch (error) {
    res.status(500).json({ error: "Error updating click count" });
  }
});
 
module.exports = router;