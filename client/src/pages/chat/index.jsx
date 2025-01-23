// const { useAppStore } = require("@/store");
// const { useEffect } = require("react");
// const { Navigate, useNavigate } = require("react-router-dom");


// const Chat = () => {
//   const { userInfo } = useAppStore();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!userInfo.profileSetup) {
//       toast("Please setup profile to continue.");
//       navigate("/profile");
//     }
//   }, [userInfo, navigate]);

//   return <div>Chat</div>;
// };

// export default Chat;

import { useAppStore } from "@/store";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const { userInfo } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please setup profile to continue.");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return <div>Chat</div>;
};

export default Chat;

