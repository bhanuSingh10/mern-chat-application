import mongoose from "mongoose";
import User from "../models/userModel.js";
import Message from "../models/messagesModel.js";

// Search Contacts Function
export const searchContacts = async (req, res, next) => {
  try {
    const { searchTerm } = req.body;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(400).send("searchTerm is required.");
    }

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [{ firstName: regex }, { lastName: regex }, { email: regex }]
        }
      ]
    });

    return res.status(200).json({
      contacts
    });
  } catch (err) {
    console.error("Error in searchContacts:", err);
    return res.status(500).send("Internal server error!");
  }
};


export const getContactsForDMList = async (req, res, next) => {
  try {
    let { userId } = req;

    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender"
            }
          },
          lastMessageTime: { $first: "$timestamp" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo"
        }
      },
      {
        $unwind: "$contactInfo"
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color"
        }
      },
      {
        $sort: {
          lastMessageTime: -1
        }
      }
    ]);

    return res.status(200).json({
      contacts
    });
  } catch (err) {
    console.error("Error in getContactsForDMList:", err);
    return res.status(500).send("Internal server error!");
  }
};
