import mongose from "mongoose";

const Funds = new mongose.Schema({
    schemeCode: { type: String, required: true, unique: true },
    schemeName: { type: String, required: true },
    isinGrowth : { type : String, required : true },
    isinDivReinvestment : { type : String, required : true },
    fundHouse : { type : String, required : true },
    schemeType : { type : String, required : true },
    schemeCategory : { type : String, required : true },
}, {timestamps : true})

export default mongose.model("Funds", Funds);