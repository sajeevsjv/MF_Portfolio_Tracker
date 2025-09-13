import express from "express";
import { getFunds, getNavHistory } from "../controllers/fundController.js";

const router = express.Router();

router.get("/", getFunds);
router.get("/:schemeCode/nav", getNavHistory);

export default router;
