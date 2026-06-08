import { Router, type IRouter } from "express";
import type { Request, Response } from "express";

const router: IRouter = Router();

const PYTHON_BASE = process.env.PYTHON_API_URL || "http://localhost:8000";

async function proxyToPython(req: Request, res: Response, path: string) {
  try {
    const url = `${PYTHON_BASE}${path}`;
    const init: RequestInit = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    };
    if (req.method !== "GET" && req.body) {
      init.body = JSON.stringify(req.body);
    }
    const upstream = await fetch(url, init);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch {
    // Python service is not reachable — return graceful fallbacks so the
    // frontend can show a proper loading/error state instead of being blank.
    if (path === "/model-status") {
      res.status(200).json({ ready: false, message: "Model service is starting up..." });
    } else if (path === "/samples") {
      res.status(200).json([]);
    } else {
      res.status(503).json({ error: "Model service unavailable. Please wait and try again." });
    }
  }
}

router.get("/model-status", (req, res) => proxyToPython(req, res, "/model-status"));
router.get("/samples", (req, res) => proxyToPython(req, res, "/samples"));
router.post("/predict", (req, res) => proxyToPython(req, res, "/predict"));

export default router;
