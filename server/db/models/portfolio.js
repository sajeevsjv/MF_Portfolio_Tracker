import mongoose from "mongoose";

const Portfolio = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schemeCode: { type: String, required: true },
    units: { type: Number, required: true },
    purchaseDate: { type: Date, required: true },
}, { timestamps: true })

export default mongoose.model("Portfolio", Portfolio);