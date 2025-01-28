import User from "../models/userModel.js";

export const searchContacts = async (req, res, next) => {
  try {
    const { searchTerm } = req.body;

    if (searchTerm === undefined || searchTerm === null) {
      return res.status(400).send("searchTerm is required.");
    }

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${X}()|[\]\\]/g,
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
      contacts,
      message: "Logout successfull."
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal server error!");
  }
};



export const getContactsForDMList = async (req, res, next) => {
  try {
   
    let {userId} = req;

    

    return res.status(200).json({
      contacts,
      message: "Logout successfull."
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).send("Internal server error!");
  }
};
