/* =========================
Toggle Button Logic
        ========================= */
function setToggle(field, value, el) {
    const group = el.closest('.toggle-group');
    group.querySelectorAll('.toggle-opt').forEach(b => b.classList.remove('active'));
    el.classList.add('active');

    if (field === 'overtime') document.getElementById('overtimeVal').value = value;
    if (field === 'gender') document.getElementById('genderVal').value = value;
}

/* =========================
   Slider Color Update
========================= */
function updateSliderColor(input) {
    const val = (input.value - input.min) / (input.max - input.min);
    const color = val < 0.4 ? '#ff5e7d' : val < 0.7 ? '#f59e0b' : '#00d4aa';
    input.style.accentColor = color;
}

/* =========================
   Prediction Counter Init
========================= */
let predCount = parseInt(sessionStorage.getItem('predCount') || '0');
document.getElementById('predCount').textContent = predCount;

/* =========================
   Render Dashboard (MAIN)
========================= */
function renderDashboard(data) {

    const isLeaving = data.prediction === 1;

    const leaveProb = data.leave_probability;
    const stayProb = data.stay_probability ;

    const riskColor = isLeaving ? '#ff5e7d' : '#00d4aa';
    const riskBg = isLeaving ? 'rgba(255,94,125,0.1)' : 'rgba(0,212,170,0.1)';

    const panel = document.getElementById('resultPanel');

    const circumference = 2 * Math.PI * 54;
    const mainProb = isLeaving ? leaveProb : stayProb;
    const dashOffset = circumference - (circumference * mainProb / 100);

    const recsHtml = data.recommendations.map((r, i) => `
        <div class="rec-item ${isLeaving ? 'warning' : ''}" style="animation-delay:${0.1 + i * 0.08}s">
            <span class="rec-icon">${isLeaving ? '⚠️' : '✅'}</span>
            <span>${r}</span>
        </div>
    `).join('');

    panel.innerHTML = `
        <div class="panel-header">
            <div>
                <div class="panel-title">Risk Assessment</div>
                <div class="panel-subtitle">Prediction confidence & recommendations</div>
            </div>
            <span class="badge" style="background:${riskBg};color:${riskColor};border:1px solid ${riskColor}40">
                ${isLeaving ? '⚠ High Risk' : '✓ Low Risk'}
            </span>
        </div>

        <div class="panel-body result-panel fade-in">

            <!-- Gauge -->
            <div class="risk-meter-wrap">
                <div class="risk-label-row">
                    <span style="font-size:12px;color:var(--text-muted);text-transform:uppercase;">Attrition Risk</span>
                    <span class="risk-verdict ${isLeaving ? 'danger' : 'safe'}">
                        ${isLeaving ? 'Likely to Leave' : 'Likely to Stay'}
                    </span>
                </div>

                <div class="gauge-container" style="width:140px;height:140px;margin:0 auto;">
                    <svg width="140" height="140">
                        <circle cx="70" cy="70" r="54" class="gauge-track"/>
                        <circle cx="70" cy="70" r="54"
                            stroke="${riskColor}"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${circumference}"
                            class="gauge-fill"
                            id="gaugeFill"/>
                    </svg>

                    <div class="gauge-center">
                        <div class="gauge-pct" style="color:${riskColor}">
                            ${Math.round(mainProb)}%
                        </div>
                        <div class="gauge-text">${isLeaving ? 'Leave' : 'Stay'}</div>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Probability Bars -->
            <div class="prob-row">
                <div class="prob-item">
                    <div class="prob-item-header">
                        <span>🟢 Staying</span>
                        <span style="color:var(--success)">${stayProb.toFixed(1)}%</span>
                    </div>
                    <div class="prob-bar-bg">
                        <div id="stayBar" class="prob-bar-fill" style="width:0%;background:var(--success)"></div>
                    </div>
                </div>

                <div class="prob-item">
                    <div class="prob-item-header">
                        <span>🔴 Leaving</span>
                        <span style="color:var(--danger)">${leaveProb.toFixed(1)}%</span>
                    </div>
                    <div class="prob-bar-bg">
                        <div id="leaveBar" class="prob-bar-fill" style="width:0%;background:var(--danger)"></div>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Recommendations -->
            <div>
                <div style="font-size:11px;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;">
                    💡 Recommendations
                </div>
                <div class="recs-list">
                    ${recsHtml}
                </div>
            </div>

        </div>
    `;

    // Animate after render
    setTimeout(() => {
        document.getElementById('gaugeFill').style.strokeDashoffset = dashOffset;
        document.getElementById('stayBar').style.width = stayProb + '%';
        document.getElementById('leaveBar').style.width = leaveProb + '%';
    }, 100);
}

/* =========================
   Form Submit (FETCH)
========================= */
document.getElementById('attritionForm').addEventListener('submit', async function (e) {

    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Analyzing…';
    btn.disabled = true;

    const formData = new FormData(this);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        renderDashboard(data);

        // Update counter
        predCount++;
        sessionStorage.setItem('predCount', predCount);
        document.getElementById('predCount').textContent = predCount;

    } catch (error) {
        console.error(error);
        alert("Something went wrong!");
    }

    btn.textContent = 'Run Attrition Analysis →';
    btn.disabled = false;
});


function loadTab(tab) {

    const panel = document.getElementById('resultPanel');

    if (tab === 'workforce') {
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">Workforce Overview</div>
            </div>
            <div class="panel-body">
                <p>Total Employees: <b>1240</b></p>
                <p>Active Employees: <b>1165</b></p>
                <p>Avg Salary: <b>₹48,000</b></p>
                <p>Avg Experience: <b>4.2 Years</b></p>
            </div>
        `;
    }

    else if (tab === 'trend') {
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">Trend Analysis</div>
            </div>
            <div class="panel-body">
                <p>Attrition Rate (Last 6 Months):</p>
                <ul>
                    <li>Jan: 18%</li>
                    <li>Feb: 16%</li>
                    <li>Mar: 15%</li>
                    <li>Apr: 14%</li>
                </ul>
            </div>
        `;
    }

    else if (tab === 'reports') {
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">Attrition Reports</div>
            </div>
            <div class="panel-body">
                <p>High Risk Employees: <b>92</b></p>
                <p>Departments Affected: <b>Sales, Support</b></p>
                <p>Top Reason: <b>Low Job Satisfaction</b></p>
            </div>
        `;
    }

    else if (tab === 'department') {
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">Department View</div>
            </div>
            <div class="panel-body">
                <p>IT: 320 Employees</p>
                <p>HR: 80 Employees</p>
                <p>Sales: 410 Employees</p>
                <p>Operations: 430 Employees</p>
            </div>
        `;
    }

    else if (tab === 'employees') {
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">Employee Records</div>
            </div>
            <div class="panel-body">
                <p>Showing sample records:</p>
                <ul>
                    <li>ID 101 - Rahul - IT</li>
                    <li>ID 102 - Sneha - HR</li>
                    <li>ID 103 - Amit - Sales</li>
                </ul>
            </div>
        `;
    }

    else if (tab === 'model') {
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">Model Configuration</div>
            </div>
            <div class="panel-body">
                <p>Model: Logistic Regression</p>
                <p>Accuracy: 87.4%</p>
                <p>Features: 9</p>
                <p>Version: v2.1</p>
            </div>
        `;
    }

    else if (tab === 'alerts') {
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">Alerts</div>
            </div>
            <div class="panel-body">
                <p>⚠ 5 High Risk Employees detected</p>
                <p>⚠ Sales Department attrition rising</p>
                <p>⚠ Work-life balance issues flagged</p>
            </div>
        `;
    }
}