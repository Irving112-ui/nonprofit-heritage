// ==================== 全局变量 ====================
const API_URL = 'https://69c496238a5b6e2dec2ae93e.mockapi.io/heritage';  // 请替换为你的 mockapi.io 地址
let heritageData = [];
let radarChart, mapChart, provinceChart, graphChart, forecastChart;
let trendData = [65, 72, 88, 95, 102, 118];  // 历史热度数据
let currentHeat = 1.2;
let currentAvgScore = 83.5;
let currentPartner = 32;

// ==================== 管理员权限判断 ====================
function isAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('admin') === '2024';   // 修改密码
}

// ==================== API 函数 ====================
async function fetchHeritages() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('获取数据失败');
        heritageData = await response.json();
        renderHeritageCards();
        updateEvalSelect();
        updateStatsCards();
        drawProvinceChart();
        renderWarningCards();
        drawGraph();
        updateAISuggestions();
        if (heritageData.length > 0) {
            const first = heritageData[0];
            document.getElementById('evalSelect').value = first.name;
            updateRadarAndScore(first.name);
        }
    } catch (error) {
        console.error('加载非遗数据失败:', error);
        document.getElementById('heritageList').innerHTML = '<div class="col-span-full text-center text-red-500">无法连接后端，请确保 mockapi.io 地址正确</div>';
    }
}

async function addHeritage(newHeritage) {
    if (!isAdmin()) {
        alert('无权限操作');
        return;
    }
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newHeritage)
        });
        if (!response.ok) throw new Error('添加失败');
        await fetchHeritages();
        alert('添加成功！');
    } catch (error) {
        console.error('添加非遗失败:', error);
        alert('添加失败，请检查网络或后端服务');
    }
}

// ==================== 页面渲染函数 ====================
function renderHeritageCards() {
    const container = document.getElementById('heritageList');
    const provinceFilter = document.getElementById('provinceFilter').value;
    container.innerHTML = '';
    let filtered = heritageData;
    if (provinceFilter !== 'all') {
        filtered = heritageData.filter(h => h.province === provinceFilter);
    }
    if (filtered.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">暂无非遗数据，请点击“管理非遗”添加。</div>';
        return;
    }
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded shadow p-4 card-hover';
        card.innerHTML = `
            <div class="h-40 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-400"><i class="fas fa-image fa-3x"></i></div>
            <h3 class="font-bold text-xl">${escapeHtml(item.name)}</h3>
            <p class="text-gray-500 text-sm">${escapeHtml(item.category)} | ${escapeHtml(item.province)}</p>
            <p class="mt-2 text-gray-600">${escapeHtml(item.desc)}</p>
            <button class="view-detail mt-3 text-blue-600 text-sm border border-blue-600 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition" data-id="${item.id}">查看数字档案</button>
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
    select.innerHTML = '';
    if (heritageData.length === 0) {
        select.innerHTML = '<option>暂无数据</option>';
        return;
    }
    heritageData.forEach(h => {
        const option = document.createElement('option');
        option.value = h.name;
        option.textContent = `${h.name} (${h.province})`;
        select.appendChild(option);
    });
}

function updateStatsCards() {
    const total = heritageData.length;
    document.getElementById('totalHeritageCount').innerText = total;
    if (total === 0) return;
    const avg = heritageData.reduce((sum, h) => sum + (h.totalScore || 0), 0) / total;
    document.getElementById('avgScore').innerText = avg.toFixed(1);
    document.getElementById('totalHeat').innerText = currentHeat.toFixed(1) + '亿+';
    document.getElementById('partnerCount').innerText = currentPartner;
    // 濒危数量
    const endangered = heritageData.filter(h => getEndangeredIndex(h) > 1.2);
    document.getElementById('endangeredCount').innerText = endangered.length;
}

function showModal(heritage) {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').innerText = `${heritage.name} 数字档案`;
    document.getElementById('modalContent').innerHTML = `
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

// ==================== 濒危指数计算 ====================
function getEndangeredIndex(h) {
    const age = h.details?.age || 60;
    const apps = h.details?.apprentices || 0;
    const acts = h.details?.activitiesPerYear || 10;
    return (age/100) + (5-Math.min(apps,5))/5 + (20-Math.min(acts,20))/20;
}

// ==================== 美化版预警卡片 ====================
function renderWarningCards() {
    const container = document.getElementById('warningCards');
    container.innerHTML = '';
    const endangered = heritageData.filter(h => getEndangeredIndex(h) > 1.2).sort((a,b) => getEndangeredIndex(b) - getEndangeredIndex(a));
    if (endangered.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-green-600 bg-white p-8 rounded shadow">✅ 暂无濒危非遗，保护状况良好！</div>';
        return;
    }
    endangered.forEach(h => {
        const index = getEndangeredIndex(h);
        const percent = Math.min(100, Math.round(index * 80)); // 映射到0-100%
        let levelColor = 'bg-red-500';
        let levelText = '高危';
        if (index < 1.4) { levelColor = 'bg-orange-500'; levelText = '中危'; }
        if (index < 1.2) { levelColor = 'bg-yellow-500'; levelText = '关注'; }
        const card = document.createElement('div');
        card.className = 'bg-white rounded shadow p-4 border-l-8 border-red-500 endangered-card';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <h3 class="font-bold text-xl">${escapeHtml(h.name)}</h3>
                <span class="px-2 py-1 rounded-full text-xs font-bold text-white ${levelColor}">${levelText}</span>
            </div>
            <p class="text-gray-600 text-sm mt-1">${escapeHtml(h.province)} · ${escapeHtml(h.category)}</p>
            <div class="mt-3 space-y-1 text-sm">
                <div>传承人年龄：<span class="font-medium">${h.details.age || '?'}</span> 岁</div>
                <div>徒弟数量：<span class="font-medium">${h.details.apprentices || 0}</span> 人</div>
                <div>年均活动：<span class="font-medium">${h.details.activitiesPerYear || 0}</span> 次</div>
            </div>
            <div class="mt-3">
                <div class="flex justify-between text-xs text-gray-600 mb-1"><span>濒危指数</span><span>${index.toFixed(2)}</span></div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="progress-bar ${levelColor} h-2 rounded-full" style="width: ${percent}%"></div>
                </div>
            </div>
            <button class="mt-3 text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition" onclick="alert('建议立即启动数字化抢救记录，并增加传承人培养投入。')">查看保护建议</button>
        `;
        container.appendChild(card);
    });
}

// ==================== 图表绘制 ====================
function drawProvinceChart() {
    const provinceCount = {};
    heritageData.forEach(h => {
        provinceCount[h.province] = (provinceCount[h.province] || 0) + 1;
    });
    const provinces = Object.keys(provinceCount);
    const counts = Object.values(provinceCount);
    const chartDom = document.getElementById('provinceChart');
    if (!chartDom) return;
    if (provinceChart) provinceChart.dispose();
    provinceChart = echarts.init(chartDom);
    provinceChart.setOption({
        title: { text: '各省非遗项目数量', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: provinces, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: counts, itemStyle: { color: '#3b82f6', borderRadius: [5,5,0,0] } }]
    });
}

function drawGraph() {
    const nodes = heritageData.map(h => ({ name: h.name, category: h.category, value: h.totalScore }));
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
            if (nodes[i].category === nodes[j].category) {
                links.push({ source: nodes[i].name, target: nodes[j].name });
            }
        }
    }
    const chartDom = document.getElementById('graphChart');
    if (!chartDom) return;
    if (graphChart) graphChart.dispose();
    graphChart = echarts.init(chartDom);
    graphChart.setOption({
        title: { text: '非遗文化关联图谱（同类别关联）' },
        series: [{
            type: 'graph',
            layout: 'force',
            data: nodes,
            links: links,
            roam: true,
            label: { show: true, position: 'right', fontSize: 12 },
            force: { repulsion: 300, edgeLength: 100 },
            lineStyle: { color: '#aaa', curveness: 0.3 },
            emphasis: { focus: 'adjacency' }
        }]
    });
}

function drawForecast() {
    const historyMonths = ['10月', '11月', '12月', '1月', '2月', '3月'];
    const historyData = trendData;
    const lastThree = historyData.slice(-3);
    const avg = lastThree.reduce((a,b)=>a+b,0)/3;
    const forecastMonths = ['4月', '5月', '6月'];
    const forecastData = [avg, avg*1.05, avg*1.08];
    const allMonths = [...historyMonths, ...forecastMonths];
    const allData = [...historyData, ...forecastData];
    const chartDom = document.getElementById('forecastChart');
    if (!chartDom) return;
    if (forecastChart) forecastChart.dispose();
    forecastChart = echarts.init(chartDom);
    forecastChart.setOption({
        title: { text: '传播热度趋势与AI预测' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: allMonths },
        yAxis: { type: 'value', name: '热度指数' },
        series: [
            { name: '历史热度', type: 'line', data: historyData, lineStyle: { color: '#3b82f6', width: 2 }, smooth: true },
            { name: 'AI预测', type: 'line', data: [...Array(historyData.length).fill(null), ...forecastData], lineStyle: { color: '#f97316', width: 2, type: 'dashed' }, symbol: 'diamond' }
        ]
    });
}

// ==================== AI 多模块建议 ====================
function updateAISuggestions() {
    const container = document.getElementById('aiSuggestions').querySelector('ul');
    if (!container) return;
    container.innerHTML = '';
    const suggestions = [];
    const endangered = heritageData.filter(h => getEndangeredIndex(h) > 1.2);
    if (endangered.length > 0) {
        suggestions.push(`⚠️ 检测到 ${endangered.length} 项濒危非遗（如 ${endangered[0].name}），建议立即启动数字化抢救记录，增加传承人培养投入。`);
    }
    if (trendData[trendData.length-1] < trendData[0]) {
        suggestions.push('📉 近半年整体传播热度呈下降趋势，建议加强新媒体宣传，制作短视频内容。');
    } else {
        suggestions.push('📈 近期传播热度稳步上升，可趁势推出数字藏品或文创产品，扩大影响力。');
    }
    const lowScore = heritageData.filter(h => h.totalScore < 70);
    if (lowScore.length > 0) {
        suggestions.push(`💡 ${lowScore.length} 项非遗综合价值评分偏低，建议深入挖掘文化内涵，优化传承与传播方式。`);
    }
    const provinceCount = {};
    heritageData.forEach(h => { provinceCount[h.province] = (provinceCount[h.province] || 0) + 1; });
    const maxProvince = Object.keys(provinceCount).reduce((a,b) => provinceCount[a] > provinceCount[b] ? a : b);
    suggestions.push(`📍 ${maxProvince} 省非遗资源最丰富，可重点打造“数字非遗+文旅”示范项目。`);
    suggestions.forEach(s => {
        const li = document.createElement('li');
        li.className = 'list-disc list-inside text-gray-700 mb-1';
        li.innerText = s;
        container.appendChild(li);
    });
}

// 文创灵感生成
function generateCreative() {
    const select = document.getElementById('evalSelect');
    const name = select.value;
    const heritage = heritageData.find(h => h.name === name);
    if (!heritage) return;
    const ideas = [
        `将${heritage.name}的传统纹样融入现代服饰设计，打造国潮系列。`,
        `开发${heritage.name}主题的AR互动体验，让用户通过手机感受技艺魅力。`,
        `设计${heritage.name}数字藏品，限量发行，提升年轻群体关注度。`,
        `结合${heritage.name}的元素，创作联名文具、家居用品，拓宽消费场景。`
    ];
    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    document.getElementById('creativeResult').innerHTML = `<div class="bg-purple-50 p-2 rounded">✨ ${randomIdea}</div>`;
}

// 传承路径规划
function generatePath() {
    const select = document.getElementById('evalSelect');
    const name = select.value;
    const heritage = heritageData.find(h => h.name === name);
    if (!heritage) return;
    const path = `为${heritage.name}规划的传承路径：
1. 建立“非遗传承基地”，与高校合作开设传习班；
2. 利用数字技术记录完整技艺流程，形成教学资源库；
3. 鼓励年轻传承人参与新媒体传播，提升项目曝光度；
4. 设立传承人专项基金，对优秀徒弟给予奖励。`;
    document.getElementById('pathResult').innerHTML = `<div class="bg-green-50 p-2 rounded">🎓 ${path}</div>`;
}

// ==================== AI 对话助手 ====================
function initChat() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    const chatBox = document.getElementById('chatBox');
    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    function sendMessage() {
        const msg = input.value.trim();
        if (!msg) return;
        appendMessage(msg, 'user');
        input.value = '';
        setTimeout(() => {
            const reply = generateAIResponse(msg);
            appendMessage(reply, 'ai');
        }, 500);
    }
    function appendMessage(text, type) {
        const div = document.createElement('div');
        div.className = `chat-message ${type === 'user' ? 'chat-user' : 'chat-ai'} self-${type === 'user' ? 'end' : 'start'}`;
        div.innerText = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    function generateAIResponse(question) {
        const lower = question.toLowerCase();
        if (lower.includes('川江号子') || lower.includes('保护')) {
            return '川江号子作为长江流域重要非遗，目前面临传承人老龄化问题。建议：1. 数字化记录全部唱腔；2. 与音乐学院合作培养青年传承人；3. 开发水上实景演出体验项目。';
        } else if (lower.includes('苗绣') || lower.includes('文创')) {
            return '苗绣纹样极具特色，可将其数字化提取为矢量图案，应用于服装、包装、数字藏品等领域，同时需注重版权保护，与传承人共享收益。';
        } else if (lower.includes('濒危')) {
            const endangered = heritageData.filter(h => getEndangeredIndex(h) > 1.2);
            if (endangered.length > 0) {
                return `当前有 ${endangered.length} 项非遗处于濒危状态，其中最紧急的是 ${endangered[0].name}，建议立即启动抢救性记录。`;
            } else {
                return '目前暂无濒危非遗，但需持续关注传承人年龄结构和活动频次。';
            }
        } else {
            return '感谢提问！关于非遗保护，建议采用数字化建档、价值评估、传播预测等大数据手段，结合AI辅助决策，实现科学化保护与活化传承。';
        }
    }
}

// ==================== 雷达图相关 ====================
function initRadarChart() {
    const chartDom = document.getElementById('radarChart');
    if (!chartDom) return;
    radarChart = echarts.init(chartDom);
}
function updateRadarChart(heritageName) {
    if (!radarChart) return;
    const heritage = heritageData.find(h => h.name === heritageName);
    if (!heritage) return;
    const v = heritage.value;
    radarChart.setOption({
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
            data: [{ value: [v.culture, v.vitality, v.economy, v.spread, v.policy], name: heritageName }],
            areaStyle: { color: 'rgba(59,130,246,0.2)' },
            lineStyle: { color: '#3b82f6', width: 2 }
        }]
    });
}
function updateRadarAndScore(heritageName) {
    const heritage = heritageData.find(h => h.name === heritageName);
    if (!heritage) return;
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

// ==================== 实时数据模拟刷新 ====================
function refreshRealTimeData() {
    currentHeat = +(currentHeat + (Math.random() - 0.5) * 0.2).toFixed(1);
    currentAvgScore = +(currentAvgScore + (Math.random() - 0.5) * 1.5).toFixed(1);
    currentPartner = Math.max(20, Math.min(50, currentPartner + Math.floor((Math.random() - 0.5) * 3)));
    document.getElementById('avgScore').innerText = currentAvgScore;
    document.getElementById('totalHeat').innerText = currentHeat.toFixed(1) + '亿+';
    document.getElementById('partnerCount').innerText = currentPartner;
    const newValue = trendData[trendData.length-1] + (Math.random() - 0.5) * 10;
    trendData.push(Math.max(50, Math.min(200, Math.round(newValue))));
    trendData.shift();
    drawForecast();
    updateStatsCards();
    renderWarningCards();
    updateAISuggestions();
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
    initRadarChart();
    drawForecast();
    await fetchHeritages();

    document.getElementById('provinceFilter').addEventListener('change', () => renderHeritageCards());
    document.getElementById('evalSelect').addEventListener('change', function() {
        if (this.value && this.value !== '暂无数据') updateRadarAndScore(this.value);
    });
    document.getElementById('refreshDataBtn').addEventListener('click', () => refreshRealTimeData());
    document.getElementById('genReportBtn').addEventListener('click', () => {
        const select = document.getElementById('evalSelect');
        if (select.value && select.value !== '暂无数据') {
            const heritage = heritageData.find(h => h.name === select.value);
            alert(`评估报告已生成：${select.value} 综合价值${heritage ? heritage.totalScore : '?'}分。详细报告将在邮箱发送。`);
        } else alert('请先选择非遗项目');
    });

    // 模态框关闭
    const modal = document.getElementById('modal');
    document.getElementById('closeModal').addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    // 管理非遗（仅管理员）
    const manageBtn = document.getElementById('manageBtn');
    if (isAdmin()) {
        manageBtn.classList.remove('hidden');
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
        manageModal.addEventListener('click', (e) => { if (e.target === manageModal) closeManage(); });
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newHeritage = {
                name: document.getElementById('name').value,
                category: document.getElementById('category').value,
                province: document.getElementById('province').value,
                desc: document.getElementById('desc').value,
                value: { culture: 8.0, vitality: 8.0, economy: 8.0, spread: 8.0, policy: 8.0 },
                totalScore: 80.0,
                details: {
                    inheritor: document.getElementById('inheritor').value,
                    techProcess: document.getElementById('techProcess').value,
                    blockchainId: '0x' + Math.random().toString(16).substr(2, 10),
                    collectDate: new Date().toISOString().slice(0,10),
                    status: document.getElementById('status').value,
                    age: 50, apprentices: 3, activitiesPerYear: 15
                }
            };
            await addHeritage(newHeritage);
            closeManage();
        });
    }

    // AI 文创和传承按钮
    document.getElementById('creativeBtn').addEventListener('click', generateCreative);
    document.getElementById('pathBtn').addEventListener('click', generatePath);

    // 初始化聊天
    initChat();

    // 定时刷新
    setInterval(() => refreshRealTimeData(), 15000);
});
