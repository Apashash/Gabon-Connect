import { Router, type IRouter } from "express";
import healthRouter from "./health";
import forfaitsRouter from "./forfaits";
import paiementRouter from "./paiement";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(forfaitsRouter);
router.use(paiementRouter);
router.use(adminRouter);

export default router;
