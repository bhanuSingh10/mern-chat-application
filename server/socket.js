import { Server as SocketIOServer } from "socket.io";
import Message from "./models/messagesModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);

    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("recieveMessage", messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("recieveMessage", messageData);
    }
  };


  const sendChannelMessage = async (message) => {
    try {
      const { channelId, sender, content, messageType, fileUrl } = message;
  
      // ✅ Check if channel exists BEFORE creating a message
      const channel = await Channel.findById(channelId).populate("members admin");
      if (!channel) {
        console.error("Channel not found:", channelId);
        return;
      }
  
      // ✅ Store the message
      const createdMessage = await Message.create({
        sender,
        content,
        messageType,
        fileUrl,
        timestamp: new Date(),
      });
  
      // ✅ Populate sender details
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .exec();
  
      // ✅ Add message to the channel
      await Channel.findByIdAndUpdate(channelId, {
        $push: { messages: createdMessage._id },
      });
  
      // ✅ Prepare final message data
      const finalData = { ...messageData._doc, channelId: channel._id };
  
      // ✅ Emit message to all channel members, including admin
      const sentTo = new Set();
      channel.members.forEach((member) => {
        const socketId = userSocketMap.get(member._id.toString());
        if (socketId && !sentTo.has(socketId)) {
          io.to(socketId).emit("receive-channel-message", finalData);
          sentTo.add(socketId);
        }
      });
  
      // ✅ Ensure admin gets the message
      if (channel.admin) {
        const adminSocketId = userSocketMap.get(channel.admin._id.toString());
        if (adminSocketId && !sentTo.has(adminSocketId)) {
          io.to(adminSocketId).emit("receive-channel-message", finalData);
        }
      }
    } catch (error) {
      console.error("Error in sendChannelMessage:", error);
    }
  };
  


  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connect:${userId} with socket Id: ${socket.id}`);
    } else {
      console.log("User ID is not provided during connection.");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("disconnect", () => disconnect(socket));
  });

  return io;
};

export default setupSocket;
