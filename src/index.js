const express = require('express');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const app = express();
app.use(express.json({ limit: '2mb' }));

// ── helpers ──────────────────────────────────────────────────────────────────

function makeCanvas(width, height) {
  return new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: 'white',
    chartCallback: (ChartJS) => {
      ChartJS.defaults.font.family = "'Helvetica Neue', Arial, sans-serif";
      ChartJS.defaults.color = '#374151';
    },
  });
}

const PURPLE  = '#4a2d8c';
const BLUE    = '#1877f2';
const GREEN   = '#16a34a';
const ORANGE  = '#f97316';
const RED     = '#e11d48';
const GRID    = '#f0edf6';

// ── chart builders ────────────────────────────────────────────────────────────

/**
 * Line+Bar combo: Megjelenés (bar) | Kattintás (line)
 */
function impressionClickChart(daily, platformColor) {
  const labels  = daily.map(d => d.label);
  const impr    = daily.map(d => Math.round(d.impressions));
  const clicks  = daily.map(d => Math.round(d.clicks));

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Megjelenés',
          data: impr,
          backgroundColor: platformColor + '44',
          borderColor: platformColor,
          borderWidth: 1.5,
          borderRadius: 4,
          yAxisID: 'yL',
        },
        {
          type: 'line',
          label: 'Kattintás',
          data: clicks,
          borderColor: RED,
          backgroundColor: 'transparent',
          pointBackgroundColor: RED,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2.5,
          tension: 0.4,
          yAxisID: 'yR',
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 11 }, boxWidth: 14, padding: 12 },
        },
        title: {
          display: true,
          text: 'Megjelenés | Kattintás',
          font: { size: 13, weight: 'bold' },
          color: '#2b1248',
          padding: { bottom: 10 },
        },
      },
      scales: {
        yL: {
          position: 'left',
          grid: { color: GRID },
          ticks: { font: { size: 10 } },
          title: { display: true, text: 'Megjelenés', font: { size: 10 }, color: platformColor },
        },
        yR: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { font: { size: 10 } },
          title: { display: true, text: 'Kattintás', font: { size: 10 }, color: RED },
        },
      },
    },
  };
}

/**
 * Line+Bar combo: Bevétel (bar) | Költség (line)
 */
function costRevenueChart(daily) {
  const labels  = daily.map(d => d.label);
  const revenue = daily.map(d => Math.round(d.revenue));
  const spend   = daily.map(d => Math.round(d.spend));

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Bevétel',
          data: revenue,
          backgroundColor: GREEN + '44',
          borderColor: GREEN,
          borderWidth: 1.5,
          borderRadius: 4,
          yAxisID: 'yL',
        },
        {
          type: 'line',
          label: 'Költség',
          data: spend,
          borderColor: ORANGE,
          backgroundColor: 'transparent',
          pointBackgroundColor: ORANGE,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2.5,
          tension: 0.4,
          yAxisID: 'yR',
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 11 }, boxWidth: 14, padding: 12 },
        },
        title: {
          display: true,
          text: 'Költség | Bevétel (Ft)',
          font: { size: 13, weight: 'bold' },
          color: '#2b1248',
          padding: { bottom: 10 },
        },
      },
      scales: {
        yL: {
          position: 'left',
          grid: { color: GRID },
          ticks: { font: { size: 10 } },
          title: { display: true, text: 'Bevétel (Ft)', font: { size: 10 }, color: GREEN },
        },
        yR: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { font: { size: 10 } },
          title: { display: true, text: 'Költség (Ft)', font: { size: 10 }, color: ORANGE },
        },
      },
    },
  };
}

/**
 * Horizontal bar: ROAS by account
 */
function roasBarChart(accounts, platformColor) {
  const filtered = accounts
    .filter(a => a.roas > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 8);

  return {
    type: 'bar',
    data: {
      labels: filtered.map(a => a.name),
      datasets: [{
        label: 'ROAS',
        data: filtered.map(a => a.roas),
        backgroundColor: filtered.map(a =>
          a.roas >= 10 ? GREEN + 'cc' :
          a.roas >= 5  ? ORANGE + 'cc' : RED + 'cc'
        ),
        borderColor: filtered.map(a =>
          a.roas >= 10 ? GREEN : a.roas >= 5 ? ORANGE : RED
        ),
        borderWidth: 1.5,
        borderRadius: 4,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'ROAS – Fiókok szerint',
          font: { size: 13, weight: 'bold' },
          color: '#2b1248',
          padding: { bottom: 10 },
        },
      },
      scales: {
        x: {
          grid: { color: GRID },
          ticks: { font: { size: 10 } },
          title: { display: true, text: 'ROAS (x)', font: { size: 10 } },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10 } },
        },
      },
    },
  };
}

/**
 * Doughnut: spend split by account
 */
function spendDoughnut(accounts, platformColor) {
  const filtered = accounts.filter(a => a.spend > 0).slice(0, 8);
  const colors = [
    platformColor, ORANGE, GREEN, RED, BLUE,
    '#8b5cf6', '#06b6d4', '#f59e0b',
  ];

  return {
    type: 'doughnut',
    data: {
      labels: filtered.map(a => a.name),
      datasets: [{
        data: filtered.map(a => a.spend),
        backgroundColor: colors.slice(0, filtered.length).map(c => c + 'dd'),
        borderColor: colors.slice(0, filtered.length),
        borderWidth: 2,
      }],
    },
    options: {
      responsive: false,
      cutout: '55%',
      plugins: {
        legend: {
          position: 'right',
          labels: { font: { size: 10 }, boxWidth: 12, padding: 8 },
        },
        title: {
          display: true,
          text: 'Költség megoszlás',
          font: { size: 13, weight: 'bold' },
          color: '#2b1248',
          padding: { bottom: 6 },
        },
      },
    },
  };
}

// ── routes ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ ok: true, service: 'chart-render-service' }));

/**
 * POST /render/platform
 * Body: { platform: 'meta'|'google', accounts: [...], daily: [...], width?, height? }
 * Returns: { charts: { impressions_clicks, cost_revenue, roas_bar, spend_donut } }
 */
app.post('/render/platform', async (req, res) => {
  try {
    const {
      platform = 'meta',
      accounts = [],
      daily = [],
      width = 640,
      height = 260,
    } = req.body;

    const color = platform === 'meta' ? BLUE : PURPLE;
    const canvas = makeCanvas(width, height);
    const smallCanvas = makeCanvas(Math.round(width * 0.48), height);

    // Chart 1 — Megjelenés | Kattintás
    const c1 = await canvas.renderToDataURL(impressionClickChart(daily, color));

    // Chart 2 — Költség | Bevétel
    const c2 = await canvas.renderToDataURL(costRevenueChart(daily));

    // Chart 3 — ROAS bar (only webshop accounts)
    const webshops = accounts.filter(a => (a.tracking_type || 'purchase') !== 'lead');
    const c3 = await smallCanvas.renderToDataURL(roasBarChart(webshops, color));

    // Chart 4 — Spend doughnut
    const c4 = await smallCanvas.renderToDataURL(spendDoughnut(accounts, color));

    res.json({
      ok: true,
      charts: {
        impressions_clicks: c1,
        cost_revenue: c2,
        roas_bar: c3,
        spend_donut: c4,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /render/single
 * Body: { config: ChartJSConfig, width?, height? }
 * Returns: { image: dataURL }
 */
app.post('/render/single', async (req, res) => {
  try {
    const { config, width = 640, height = 300 } = req.body;
    const canvas = makeCanvas(width, height);
    const image = await canvas.renderToDataURL(config);
    res.json({ ok: true, image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chart render service running on port ${PORT}`);
});
