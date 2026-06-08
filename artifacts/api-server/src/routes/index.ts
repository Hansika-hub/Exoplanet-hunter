import { Router, type IRouter } from "express";
import healthRouter from "./health";
import modelRouter from "./model";

const router: IRouter = Router();

router.use(healthRouter);
router.use(modelRouter);

export default router;
