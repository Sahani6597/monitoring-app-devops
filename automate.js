import os from "os";
import axios from "axios";

// Configuration
const SERVER_URL = process.env.SERVER_URL || "http://localhost:4545";
const HOSTNAME = os.hostname();
const COLLECTION_INTERVAL = process.env.COLLECTION_INTERVAL || 5000; // 5 seconds

/**
 * Collect system metrics
 */
function collectMetrics() {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const uptime = os.uptime();

  // Calculate CPU usage average
  const avgLoad = os.loadavg()[0]; // 1-minute average load
  const cpuUsage = (avgLoad / cpus.length) * 100; // Convert to percentage

  return {
    hostname: HOSTNAME,
    cpu: Math.round(cpuUsage * 100) / 100,
    memory: Math.round((usedMemory / totalMemory) * 100 * 100) / 100,
    disk: 0, // Disk usage would require additional library like `diskusage`
    uptime: Math.floor(uptime),
  };
}

/**
 * Send metrics to the server
 */
async function sendMetrics() {
  try {
    const metrics = collectMetrics();
    
    const response = await axios.post(
      `${SERVER_URL}/api/v11/metrics`,
      metrics,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    console.log(`✓ Metrics sent successfully at ${new Date().toISOString()}`);
    console.log(`  CPU: ${metrics.cpu}% | Memory: ${metrics.memory}% | Uptime: ${metrics.uptime}s`);
    
  } catch (error) {
    console.error(`✗ Failed to send metrics: ${error.message}`);
    if (error.response?.status) {
      console.error(`  Server responded with status: ${error.response.status}`);
    }
  }
}

/**
 * Start automatic metrics collection
 */
function startMetricsCollection() {
  console.log(`Starting metrics collector...`);
  console.log(`Server URL: ${SERVER_URL}`);
  console.log(`Hostname: ${HOSTNAME}`);
  console.log(`Collection interval: ${COLLECTION_INTERVAL}ms\n`);

  // Send metrics immediately on start
  sendMetrics();

  // Then send every COLLECTION_INTERVAL
  setInterval(sendMetrics, COLLECTION_INTERVAL);
}

// Start the collector
startMetricsCollection();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n Stopping metrics collector...");
  process.exit(0);
});
