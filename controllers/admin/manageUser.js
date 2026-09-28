import userModel from "../../models/user.js";

export const usersManage = async (req, res) => {
    try {

        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;

        console.log("query paramsn : ", req.query.page)
        const limit = 4;
        const skip = (page - 1) * limit;

        const query = {
            $or: [
                {name : {$regex : search , $options : "i"}},
                {email : {$regex : search ,  $options : "i"}}
            ]
        };

        const users = await userModel.find(query).skip(skip).limit(limit).sort({createdAt : -1});

        const totalUsers = await userModel.countDocuments(query);

        const blockedUsers = await userModel.countDocuments({
            status : "blocked"
        });

        const totalPages = Math.ceil(totalUsers / limit);

        res.render("admin/viewUser", {
            users,
            search,
            totalUsers,
            blockedUsers,
            currentPage: page,
            limit,
            totalPages
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(`this error happened on userManage function : ${error}` );
    }
};

export const blockUser = async (req, res) => {
    try {
        console.log("blockedUser fucntion is hited")
        const userId = req.params.id;
        console.log(`this is the suer entered id for blocking : ${userId}`);
        const result = await userModel.findByIdAndUpdate(userId, {
            status : "blocked"
    });
        return res.status(200).json({
            success : true,
            message : "user blocked successfully"
        })
    } catch (error) {
        console.log(`this error comes from blockedUser function : ${error}`)
        return res.status(500).json({
            success : false,
            message : "Failed to block user"
        })
    }
};

export const unblockUser = async (req, res) => {
   try {
        console.log("unblockUser function is hited")
        const userId = req.params.id;
        await userModel.findByIdAndUpdate(userId, {
            status : "active"
    })
        return res.status(200).json({
            success : true,
            message : "User unblocked successfully"
        })
   } catch (error) {
        console.log(`this error comes from ublockUser functon : ${error}`)
        return res.status(500).json({
            success : false,
            message : "Failed unblock user"
        })
   }
}