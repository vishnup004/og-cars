import offerModel from "../../models/offer.js";
export const addNewOffer = async (req, res) => {
    console.log("function hited ")
    const {name,description,applyTo,discountType,discountValue,startDate,endDate} = req.body;

    const result = await offerModel.create({
        name,
        applyTo,
        description,
        discountValue,
        discountType,
        startDate,
        endDate
    });

    if(!result){
        return res.json({
            success : false,
            message : "Something went wrong"
        })
    }

    console.log('offer added')
    return res.json({
        success : true,
        message : "offer added"
    })
};
export const loadOfferPage = async (req, res) => {
    const offers = await offerModel.find();

    if(!offers) {
        return console.log("no offers")
    }

    return res.render("admin/offer", {
        offers
    })
}

export const deleteOffer = async (req,res) => {
    const offerId = req.params.id;

    const isDelete = await offerModel.findByIdAndDelete(offerId)
    console.log("delete: ", isDelete)
    if(!isDelete){
        return res.json({
            success : false,
            message : "Delete failed"
        })
    }

    return res.json({
        success : true,
        message : "Delete success"
    })
}
// export const searchOffers = async (req, res) => {
//   try {
//     const search = (req.query.search || "").trim();
//     const applyTo = req.query.applyTo || "";
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = 10;

//     const query = {};
//     if (search) query.name = { $regex: search, $options: "i" };
//     if (applyTo) query.applyTo = applyTo;

//     const totalCount = await offerModel.countDocuments(query);
//     const totalPage = Math.max(1, Math.ceil(totalCount / limit));

//     const offers = await offerModel
//       .find(query)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//     return res.json({
//       success: true,
//       offers,
//       totalCount,
//       totalPage,
//       currentPage: page,
//       limit,
//     });
//   } catch (error) {
//     console.error("Search offers error:", error);
//     return res.status(500).json({ success: false, message: "Failed to load offers." });
//   }
// };