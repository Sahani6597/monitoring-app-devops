import { Router } from "express";

const router = Router();

// In-memory metrics storage
const metrics = [];

const findMetricIndex = (hostname) =>
  metrics.findIndex((item) => item.hostname === hostname);

router.post("/", (req, res) => {
  const { hostname, cpu, memory, disk, uptime } = req.body;

  if (!hostname) {
    return res.status(400).json({
      success: false,
      message: "hostname is required",
    });
  }

  const timestamp = new Date().toISOString();
  const existingIndex = findMetricIndex(hostname);

  const metric = {
    id: existingIndex >= 0 ? metrics[existingIndex].id : Date.now(),
    hostname,
    cpu,
    memory,
    disk,
    uptime,
    timestamp,
  };

  if (existingIndex >= 0) {
    metrics[existingIndex] = metric;
    console.log("Metric updated:", metric);
    return res.status(200).json({
      success: true,
      message: "Metric updated",
      data: metric,
    });
  }

  metrics.push(metric);
  console.log("Metric saved:", metric);
  console.log("Metrics Array:", metrics);

  res.status(201).json({
    success: true,
    message: "Metric saved",
    data: metric,
  });
});

router.put("/:hostname", (req, res) => {
  const { hostname } = req.params;
  const existingIndex = findMetricIndex(hostname);

  if (existingIndex < 0) {
    return res.status(404).json({
      success: false,
      message: `No metric found for hostname: ${hostname}`,
    });
  }

  const updatedMetric = {
    ...metrics[existingIndex],
    ...req.body,
    hostname,
    timestamp: new Date().toISOString(),
  };

  metrics[existingIndex] = updatedMetric;

  res.status(200).json({
    success: true,
    message: "Metric updated",
    data: updatedMetric,
  });
});

router.get("/", (req, res) => {
  res.json({
    success: true,
    count: metrics.length,
    data: metrics,
  });
});

router.get("/:hostname", (req, res) => {
  const { hostname } = req.params;
  const existingIndex = findMetricIndex(hostname);

  if (existingIndex < 0) {
    return res.status(404).json({
      success: false,
      message: `No metric found for hostname: ${hostname}`,
    });
  }

  res.json({
    success: true,
    data: metrics[existingIndex],
  });
});

export default router;