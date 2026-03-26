// ==================== 全局变量 ====================
const API_URL = 'https://69c4845f8a5b6e2dec2aadfa.mockapi.io/:endpoint';
let heritageData = [];
let radarChart, trendChart, mapChart;
let trendData = [65, 72, 88, 95, 102, 118];
let currentHeat = 1.2;
let currentAvgScore = 83.5;
let currentPartner = 32;

// ==================== API 函数 ====================
async function fetchHeritages() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('获取数据失败');
        heritageData = await response.json();
        renderHeritageCards();
        updateEvalSelect();
        updateStatsCards();

        // 如果有数据，更新雷达图（使用第一个非遗）
        if (heritageData.length > 0) {
            const first = heritageData[0];
            const select = document.getElementById('evalSelect');
            select.value = first.name;
            updateRadarChart(first.name);
            updateRadarAndScore(first.name);
        } else {
            // 无数据时显示提示
            document.getElementById('radarChart').innerHTML = '<div class="text-center text-gray-500">暂无数据</div>';
        }
    } catch (error) {
        console.error('加载非遗数据失败:', error);
        document.getElementById('heritageList').innerHTML = '<div class="col-span-full text-center text-red-500">无法连接后端，请确保 json-server 已启动 (http://localhost:3000)</div>';
    }
}

async function addHeritage(newHeritage) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newHeritage)
        });
        if (!response.ok) throw new Error('添加失败');
        await fetchHeritages();  // 重新加载列表
        alert('添加成功！');
    } catch (error) {
        console.error('添加非遗失败:', error);
        alert('添加失败，请检查网络或后端服务');
    }
}

// ==================== 页面渲染函数 ====================
function renderHeritageCards() {
    const container = document.getElementById('heritageList');
    if (!container) return;
    container.innerHTML = '';
    if (heritageData.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">暂无非遗数据，请点击“管理非遗”添加。</div>';
        return;
    }
    heritageData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded shadow p-4 card-hover';
        card.innerHTML = `
            <div class="h-40 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-400">
                <i class="fas fa-image fa-3x"></i>
            </div>
            <h3 class="font-bold text-xl">${escapeHtml(item.name)}</h3>
            <p class="text-gray-500 text-sm">${escapeHtml(item.category)}</p>
            <p class="mt-2 text-gray-600">${escapeHtml(item.desc)}</p>
            <button class="view-detail mt-3 text-blue-600 text-sm border border-blue-600 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition" data-id="${item.id}">
                查看数字档案
            </button>
        `;
        container.appendChild(card);
    });
    document.querySelectorAll('.view-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            const heritage = heritageData.find(h => h.id === id);
            if (heritage) showModal(heritage);
        });
    });
}

function updateEvalSelect() {
    const select = document.getElementById('evalSelect');
    if (!select) return;
    select.innerHTML = '';
    if (heritageData.length === 0) {
        select.innerHTML = '<option>暂无数据</option>';
        return;
    }
    heritageData.forEach(h => {
        const option = document.createElement('option');
        option.value = h.name;
        option.textContent = h.name;
        select.appendChild(option);
    });
}

function updateStatsCards() {
    const total = heritageData.length;
    document.getElementById('totalHeritageCount').innerText = total;
    if (total === 0) {
        document.getElementById('avgScore').innerText = '0';
        return;
    }
    const avg = heritageData.reduce((sum, h) => sum + (h.totalScore || 0), 0) / total;
    document.getElementById('avgScore').innerText = avg.toFixed(1);
    document.getElementById('totalHeat').innerText = currentHeat.toFixed(1) + '亿+';
    document.getElementById('partnerCount').innerText = currentPartner;
}

function showModal(heritage) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    modalTitle.innerText = `${heritage.name} 数字档案`;
    modalContent.innerHTML = `
        <div class="space-y-4">
            <div><strong>传承人：</strong> ${escapeHtml(heritage.details.inheritor)}</div>
            <div><strong>技艺流程：</strong> ${escapeHtml(heritage.details.techProcess)}</div>
            <div><strong>区块链存证ID：</strong> <span class="font-mono text-sm bg-gray-100 p-1">${escapeHtml(heritage.details.blockchainId)}</span></div>
            <div><strong>数字化采集时间：</strong> ${escapeHtml(heritage.details.collectDate)}</div>
            <div><strong>当前状态：</strong> ${escapeHtml(heritage.details.status)}</div>
            <div><strong>综合价值评分：</strong> ${heritage.totalScore} 分</div>
            <div><strong>评估维度：</strong> 文化稀缺性 ${heritage.value.culture} / 10，传承活力 ${heritage.value.vitality} / 10，经济潜力 ${heritage.value.economy} / 10</div>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// ==================== 图表初始化与更新 ====================
function initMapChart() {
    const chartDom = document.getElementById('mapChart');
    if (!chartDom) return;
    mapChart = echarts.init(chartDom);
    const option = {
        title: { text: '沿线省份非遗分布热度', left: 'center' },
        tooltip: { trigger: 'item' },
        xAxis: { type: 'category', data: ['重庆', '四川', '贵州', '云南', '广西', '甘肃', '青海', '新疆'] },
        yAxis: { type: 'value', name: '非遗项目数量（项）' },
        series: [{
            data: [342, 521, 428, 356, 487, 213, 176, 142],
            type: 'bar',
            itemStyle: { color: '#3b82f6', borderRadius: [5,5,0,0] }
        }]
    };
    mapChart.setOption(option);
}

function initRadarChart() {
    const chartDom = document.getElementById('radarChart');
    if (!chartDom) return;
    radarChart = echarts.init(chartDom);
    // 初始为空，等待数据后再更新
}

function updateRadarChart(heritageName) {
    if (!radarChart) {
        console.warn('radarChart 未初始化');
        return;
    }
    const heritage = heritageData.find(h => h.name === heritageName);
    if (!heritage) return;
    const values = heritage.value;
    const option = {
        radar: {
            indicator: [
                { name: '文化稀缺性', max: 10 },
                { name: '传承活力', max: 10 },
                { name: '经济潜力', max: 10 },
                { name: '传播效能', max: 10 },
                { name: '政策适配', max: 10 }
            ],
            shape: 'circle'
        },
        series: [{
            type: 'radar',
            data: [{ value: [values.culture, values.vitality, values.economy, values.spread, values.policy], name: heritageName }],
            areaStyle: { color: 'rgba(59,130,246,0.2)' },
            lineStyle: { color: '#3b82f6', width: 2 }
        }]
    };
    radarChart.setOption(option, true);
}

function updateRadarAndScore(heritageName) {
    const heritage = heritageData.find(h => h.name === heritageName);
    if (heritage) {
        updateRadarChart(heritageName);
        document.getElementById('evalName').innerText = heritageName;
        document.getElementById('evalScore').innerText = heritage.totalScore;
        const cultureStars = '★'.repeat(Math.floor(heritage.value.culture / 2)) + '☆'.repeat(5 - Math.floor(heritage.value.culture / 2));
        const vitalityStars = '★'.repeat(Math.floor(heritage.value.vitality / 2)) + '☆'.repeat(5 - Math.floor(heritage.value.vitality / 2));
        const economyStars = '★'.repeat(Math.floor(heritage.value.economy / 2)) + '☆'.repeat(5 - Math.floor(heritage.value.economy / 2));
        document.getElementById('evalDetails').innerHTML = `
            <p>文化稀缺性：${cultureStars}</p>
            <p>传承活力：${vitalityStars}</p>
            <p>经济潜力：${economyStars}</p>
        `;
    }
}

function initTrendChart() {
    const chartDom = document.getElementById('trendChart');
    if (!chartDom) return;
    trendChart = echarts.init(chartDom);
    updateTrendChart();
}

function updateTrendChart() {
    if (!trendChart) return;
    const option = {
        title: { text: '近6个月传播热度指数' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['10月', '11月', '12月', '1月', '2月', '3月'] },
        yAxis: { type: 'value' },
        series: [{
            data: trendData,
            type: 'line',
            smooth: true,
            lineStyle: { color: '#f97316', width: 3 },
            areaStyle: { opacity: 0.1 }
        }]
    };
    trendChart.setOption(option, true);
}

// ==================== 实时数据模拟刷新 ====================
function refreshRealTimeData() {
    currentHeat = +(currentHeat + (Math.random() - 0.5) * 0.2).toFixed(1);
    currentAvgScore = +(currentAvgScore + (Math.random() - 0.5) * 1.5).toFixed(1);
    currentPartner = Math.max(20, Math.min(50, currentPartner + Math.floor((Math.random() - 0.5) * 3)));
    document.getElementById('avgScore').innerText = currentAvgScore;
    document.getElementById('totalHeat').innerText = currentHeat.toFixed(1) + '亿+';
    document.getElementById('partnerCount').innerText = currentPartner;

    const newValue = trendData[5] + (Math.random() - 0.5) * 10;
    trendData[5] = Math.max(50, Math.min(200, Math.round(newValue)));
    updateTrendChart();

    const select = document.getElementById('evalSelect');
    if (heritageData.length > 0 && select.value !== '暂无数据') {
        const heritage = heritageData.find(h => h.name === select.value);
        if (heritage) {
            heritage.value.culture = Math.min(10, Math.max(0, heritage.value.culture + (Math.random() - 0.5) * 0.6));
            heritage.value.vitality = Math.min(10, Math.max(0, heritage.value.vitality + (Math.random() - 0.5) * 0.6));
            heritage.value.economy = Math.min(10, Math.max(0, heritage.value.economy + (Math.random() - 0.5) * 0.6));
            heritage.totalScore = (heritage.value.culture + heritage.value.vitality + heritage.value.economy + heritage.value.spread + heritage.value.policy) / 5 * 10;
            heritage.totalScore = Math.round(heritage.totalScore * 10) / 10;
            updateRadarAndScore(select.value);
        }
    }

    const suggestions = [
        '📹 建议为“川江号子”补充短视频素材，提升传播热度',
        '📊 荣昌夏布搜索量上升32%，可加大文创开发力度',
        '🌍 铜梁龙舞在海外平台热度高，建议制作多语言版本',
        '🔥 川江号子本月热度上升20%，可申请文化传播专项',
        '💡 建议为铜梁龙舞开发数字藏品，已有多家平台接洽',
        '🎨 苗绣纹样数字化可助力设计新文创，提升附加值'
    ];
    const shuffled = suggestions.sort(() => 0.5 - Math.random());
    const ul = document.getElementById('suggestionsList');
    ul.innerHTML = '';
    shuffled.slice(0, 3).forEach(s => {
        const li = document.createElement('li');
        li.className = 'list-disc list-inside';
        li.innerText = s;
        ul.appendChild(li);
    });
}

// ==================== 辅助函数 ====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', async function() {
    // 1. 先初始化所有图表（容器已存在）
    initMapChart();
    initRadarChart();   // 创建空雷达图，稍后填充数据
    initTrendChart();

    // 2. 加载数据（会触发渲染卡片、更新雷达图等）
    await fetchHeritages();

    // 3. 绑定事件（下拉选择变化、按钮等）
    const evalSelect = document.getElementById('evalSelect');
    evalSelect.addEventListener('change', function() {
        if (this.value && this.value !== '暂无数据') {
            updateRadarAndScore(this.value);
        }
    });

    const refreshBtn = document.getElementById('refreshDataBtn');
    refreshBtn.addEventListener('click', function() {
        refreshRealTimeData();
    });

    const reportBtn = document.getElementById('genReportBtn');
    reportBtn.addEventListener('click', function() {
        const select = document.getElementById('evalSelect');
        if (select.value && select.value !== '暂无数据') {
            const heritage = heritageData.find(h => h.name === select.value);
            alert(`评估报告已生成：${select.value} 综合价值${heritage ? heritage.totalScore : '?'}分。详细报告将在邮箱发送。`);
        } else {
            alert('请先选择非遗项目');
        }
    });

    // 模态框关闭逻辑
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });

    // 管理非遗模态框逻辑
    const manageBtn = document.getElementById('manageBtn');
    const manageModal = document.getElementById('manageModal');
    const closeManageModal = document.getElementById('closeManageModal');
    const cancelManage = document.getElementById('cancelManage');
    const addForm = document.getElementById('addHeritageForm');

    manageBtn.addEventListener('click', () => {
        manageModal.classList.remove('hidden');
        manageModal.classList.add('flex');
    });
    function closeManage() {
        manageModal.classList.add('hidden');
        manageModal.classList.remove('flex');
        addForm.reset();
    }
    closeManageModal.addEventListener('click', closeManage);
    cancelManage.addEventListener('click', closeManage);
    manageModal.addEventListener('click', (e) => {
        if (e.target === manageModal) closeManage();
    });

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newHeritage = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            desc: document.getElementById('desc').value,
            value: {
                culture: 8.0,
                vitality: 8.0,
                economy: 8.0,
                spread: 8.0,
                policy: 8.0
            },
            totalScore: 80.0,
            details: {
                inheritor: document.getElementById('inheritor').value,
                techProcess: document.getElementById('techProcess').value,
                blockchainId: '0x' + Math.random().toString(16).substr(2, 10),
                collectDate: new Date().toISOString().slice(0,10),
                status: document.getElementById('status').value
            }
        };
        await addHeritage(newHeritage);
        closeManage();
    });

    // 自动实时刷新（每10秒）
    setInterval(() => {
        refreshRealTimeData();
    }, 10000);
});
