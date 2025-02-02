
import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/userModel.js";

// Create a new channel
export const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    if (!name || name.trim() === "") {
      return res.status(400).send({ msg: "Channel name is required." });
    }

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).send({ msg: "At least one member is required." });
    }

    const isAdminExists = await User.exists({ _id: userId });
    if (!isAdminExists) {
      return res.status(400).send({ msg: "Admin user not found." });
    }

    const validMembersCount = await User.countDocuments({
      _id: { $in: members }
    });
    if (validMembersCount !== members.length) {
      return res.status(400).send({ msg: "Some members are not valid users." });
    }

    const existingChannel = await Channel.findOne({ name });
    if (existingChannel) {
      return res
        .status(400)
        .send({ msg: "A channel with this name already exists." });
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId
    });

    await newChannel.save();

    return res.status(201).json({ channel: newChannel });
  } catch (err) {
    console.error("Error in createChannel:", err);
    return res.status(500).send("Internal server error!");
  }
};

// Get all channels for a user
export const getUserChannels = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const channels = await Channel.find(
      { $or: [{ admin: userId }, { members: userId }] },
      "name admin members updatedAt"
    ).sort({ updatedAt: -1 });

    return res.status(200).json({ channels });
  } catch (err) {
    console.error("Error in getUserChannels:", err);
    return res.status(500).send("Internal server error!");
  }
};

export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color"
      }
    });

    if (!channel) {
      return res.status(404).send("Channel not found.");
    }

    const messages = channel.messages;

    return res.status(200).json({ messages });
  } catch (err) {
    console.error("Error in getChannel:", err);
    return res.status(500).send("Internal server error!");
  }
};
