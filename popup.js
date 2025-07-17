function secondsToReadable(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  
  function renderChart(data) {
    const ctx = document.getElementById("usageChart").getContext("2d");
    const labels = Object.keys(data);
    const durations = Object.values(data);
  
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          label: "Time Spent (s)",
          data: durations,
          backgroundColor: labels.map((_, i) =>
            `hsl(${(i * 50) % 360}, 70%, 60%)`
          )
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const domain = tooltipItem.label;
                const seconds = tooltipItem.raw;
                return `${domain}: ${secondsToReadable(seconds)}`;
              }
            }
          }
        }
      }
    });
  }
  
  // Fetch and show data
  chrome.storage.local.get(["usage"], (data) => {
    const usage = data.usage || {};
    renderChart(usage);
  });
  
  // Reset data
  document.getElementById("reset").addEventListener("click", () => {
    chrome.storage.local.set({ usage: {} }, () => {
      location.reload();
    });
  });
  