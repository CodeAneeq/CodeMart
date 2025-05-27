import mongoose from "mongoose";

export default async function connectDB(URI) {
    try {
      await mongoose.connect(URI);
        console.log("Mongo DB Connected Successfully");
    } catch (error) {
        console.log("Mongo Db Failed", error);
        
    }
}