// script.js
// 完整数据集：原有14项 + 新增20项，共34项
const initialData = [
    { id: 1, name: "广东醒狮", province: "广东", img: "img/广东醒狮.jpg", category: "传统舞蹈", totalScore: 95, desc: "南狮之都，融武术、舞蹈、音乐为一体的传统艺术。醒狮被认为是驱邪避害的吉祥瑞兽，展现了中华民族昂扬向上的精神风貌。" },
    { id: 2, name: "川剧变脸", province: "四川", img: "img/川剧.jpg", category: "传统戏剧", totalScore: 92, desc: "川剧瑰宝。通过瞬间变换面谱，表现人物内心深处激愤、惊恐、绝望等强烈情感，是浪漫主义的表现手法。" },
    { id: 3, name: "蜀锦织造", province: "四川", img: "img/蜀锦织造技艺.jpg", category: "传统技艺", totalScore: 94, desc: "起源于战国，图案绚丽、色彩鲜艳，被誉为‘中国名锦之首’，是丝绸之路上的重要商品。" },
    { id: 4, name: "侗族大歌", province: "广西", img: "img/侗族大歌.jpg", category: "传统音乐", totalScore: 96, desc: "无伴奏、多声部合唱。模拟鸟叫虫鸣、高山流水，被誉为‘清泉般闪光的艺术’。" },
    { id: 5, name: "壮族织锦", province: "广西", img: "img/壮族织锦技艺.jpg", category: "传统技艺", totalScore: 91, desc: "四大名锦之一，几何纹样结构严谨，展现了南疆少数民族热烈、粗犷的审美意趣。" },
    { id: 6, name: "傣族泼水节", province: "云南", img: "img/傣族泼水节.jpg", category: "民俗", totalScore: 89, desc: "傣族最隆重节日，象征洗去灾祸，换取吉祥，承载了对水的敬重与生命崇拜。" },
    { id: 7, name: "安塞腰鼓", province: "陕西", img: "img/安塞腰鼓.jpg", category: "传统舞蹈", totalScore: 88, desc: "黄土高原磅礴生命的象征。鼓手在漫天黄尘中奔跑跳跃，气势排山倒海。" },
    { id: 8, name: "苗绣", province: "贵州", img: "img/苗绣.jpg", category: "传统技艺", totalScore: 93, desc: "穿在身上的无字史书。记录了民族神话与迁徙历史，图案奇特且极富想象力。" },
    { id: 9, name: "热贡艺术", province: "青海", img: "img/热贡艺术.jpg", category: "传统美术", totalScore: 95, desc: "发祥于隆务河畔，包含唐卡、壁画、雕塑。采用纯金、宝石入色，画风精细入微。" },
    { id: 10, name: "花儿", province: "宁夏", img: "img/花儿.jpg", category: "传统音乐", totalScore: 87, desc: "西北高亢民歌，记录了社会历史与日常生活，被誉为大西北之魂。" },
    { id: 11, name: "玛纳斯", province: "新疆", img: "img/玛纳斯.jpg", category: "民间文学", totalScore: 94, desc: "柯尔克孜族英雄史诗，讲述英雄玛纳斯抵御外辱的故事，展现了民族精神底蕴。" },
    { id: 12, name: "蒙古族呼麦", province: "内蒙古", img: "img/蒙古族呼麦.jpg", category: "传统音乐", totalScore: 93, desc: "神奇的一人双声部喉音艺术。低音如山风，高音如笛鸣，体现游牧民族自然观。" },
    { id: 13, name: "铜梁龙舞", province: "重庆", img: "img/铜梁龙舞.jpg", category: "传统舞蹈", totalScore: 90, desc: "重庆文化图腾。人在铁水烟花中狂舞，展现了中国龙文化的雄浑气魄。" },
    { id: 14, name: "川江号子", province: "重庆", img: "img/川江号子.jpg", category: "传统音乐", totalScore: 85, desc: "记录了纤夫在急流险滩中的坚韧与艰辛，旋律高亢有力，是长江精神图腾。" },
    // ⬇️ 新增20项非遗
    { id: 15, name: "粤剧", province: "广东", img: "img/粤剧.jpg", category: "传统戏剧", totalScore: 96, desc: "有‘南国红豆’之称，融合唱念做打，是岭南文化瑰宝，被列入人类非物质文化遗产代表作名录。" },
    { id: 16, name: "广绣", province: "广东", img: "img/广绣.jpg", category: "传统技艺", totalScore: 93, desc: "中国四大名绣之一，针法多变，构图饱满，色彩富丽，远销海内外。" },
    { id: 17, name: "蜀绣", province: "四川", img: "img/蜀绣.jpg", category: "传统技艺", totalScore: 94, desc: "与苏绣、湘绣、粤绣齐名，以软缎和彩丝为主要原料，针法严谨细腻。" },
    { id: 18, name: "泸州老窖酒酿制技艺", province: "四川", img: "img/泸州老窖酒酿制技艺.jpg", category: "传统技艺", totalScore: 92, desc: "中国浓香型白酒的典型代表，其传统酿造技艺传承六百余年，是国家级非遗。" },
    { id: 19, name: "秀山花灯", province: "重庆", img: "img/秀山花灯.jpg", category: "传统舞蹈", totalScore: 89, desc: "集歌、舞、戏于一体的民间艺术，造型别致，表演诙谐，是重庆重要的文化名片。" },
    { id: 20, name: "梁平木版年画", province: "重庆", img: "img/梁平木版年画.jpg", category: "传统美术", totalScore: 90, desc: "与四川绵竹年画齐名，色彩浑厚，构图饱满，具有浓郁的巴渝特色。" },
    { id: 21, name: "刘三姐歌谣", province: "广西", img: "img/刘三姐歌谣.jpg", category: "民间文学", totalScore: 96, desc: "壮族民间传说，以歌代言，被誉为‘歌仙’，是广西最具代表性的文化符号之一。" },
    { id: 22, name: "壮剧", province: "广西", img: "img/壮剧.jpg", category: "传统戏剧", totalScore: 88, desc: "壮族戏曲剧种，唱腔丰富，表演细腻，是中国少数民族戏剧的重要组成部分。" },
    { id: 23, name: "傣族孔雀舞", province: "云南", img: "img/傣族孔雀舞.jpg", category: "传统舞蹈", totalScore: 94, desc: "傣族最富盛名的传统舞蹈，模仿孔雀姿态，灵动优雅，是云南文化瑰宝。" },
    { id: 24, name: "白族扎染", province: "云南", img: "img/白族扎染.jpg", category: "传统技艺", totalScore: 91, desc: "大理白族传统手工印染技艺，图案自然晕染，古朴雅致，被列为国家级非遗。" },
    { id: 25, name: "秦腔", province: "陕西", img: "img/秦腔.jpg", category: "传统戏剧", totalScore: 95, desc: "中国最古老的戏曲剧种之一，高亢激昂，对诸多剧种产生深远影响。" },
    { id: 26, name: "凤翔泥塑", province: "陕西", img: "img/凤翔泥塑.jpg", category: "传统美术", totalScore: 89, desc: "陕西凤翔民间彩绘泥偶，造型夸张，色彩浓烈，被誉为民艺奇葩。" },
    { id: 27, name: "蒙古族长调民歌", province: "内蒙古", img: "img/蒙古族长调民歌.jpg", category: "传统音乐", totalScore: 97, desc: "草原游牧文化的活化石，旋律悠长舒缓，被列入人类非物质文化遗产。" },
    { id: 28, name: "马头琴音乐", province: "内蒙古", img: "img/马头琴音乐.jpg", category: "传统音乐", totalScore: 95, desc: "蒙古族代表性乐器，音色深沉粗犷，承载着游牧民族的历史记忆。" },
    { id: 29, name: "苗族银饰锻制技艺", province: "贵州", img: "img/苗族银饰锻制技艺.jpg", category: "传统技艺", totalScore: 93, desc: "苗族银饰工艺精湛，图案寓意丰富，是苗族穿在身上的史诗。" },
    { id: 30, name: "安顺地戏", province: "贵州", img: "img/安顺地戏.jpg", category: "传统戏剧", totalScore: 88, desc: "贵州古老民间戏剧，戴面具表演，保留古朴军傩遗风，被称为‘中国戏剧活化石’。" },
    { id: 31, name: "土族盘绣", province: "青海", img: "img/土族盘绣.jpg", category: "传统美术", totalScore: 90, desc: "土族妇女世代传承的刺绣艺术，色彩绚丽，针法独特，是高原民族审美的结晶。" },
    { id: 32, name: "维吾尔木卡姆艺术", province: "新疆", img: "img/维吾尔木卡姆艺术.jpg", category: "传统音乐", totalScore: 98, desc: "集歌、舞、乐于一体的大型综合艺术，被列为人类非物质文化遗产代表作。" },
    { id: 33, name: "哈萨克族阿依特斯", province: "新疆", img: "img/哈萨克族阿依特斯.jpg", category: "民间文学", totalScore: 92, desc: "哈萨克族民间口头对唱艺术，即兴编词，充满智慧，是草原上的文化对歌。" },
    { id: 34, name: "回族民间器乐", province: "宁夏", img: "img/回族民间器乐.jpg", category: "传统音乐", totalScore: 87, desc: "宁夏回族传统乐器如口弦、咪咪等，音色独特，是丝绸之路上文化交流的见证。" }
];

let heritageData = [...initialData];

// 坐标映射
const geoCoordMap = {
    '广东': [113.23, 23.16], '四川': [104.06, 30.67], '重庆': [106.54, 29.59],
    '广西': [108.33, 22.84], '云南': [102.73, 25.04], '陕西': [108.95, 34.27],
    '内蒙古': [111.65, 40.82], '贵州': [106.71, 26.57], '青海': [101.74, 36.56],
    '新疆': [87.68, 43.77], '宁夏': [106.27, 38.47]
};

// 核心初始化
function init() {
    setWebBackground();
    refreshAllModules();
    initDataManager();
    initChat();
}

// 设置网页整体背景
function setWebBackground() {
    const fixedBg = document.querySelector('.fixed-bg');
    if (fixedBg) {
        fixedBg.style.backgroundImage = "url('img/背景.jpg')";
        fixedBg.style.backgroundSize = "cover";
        fixedBg.style.backgroundPosition = "center";
        fixedBg.style.backgroundAttachment = "fixed";
        fixedBg.style.opacity = "0.3";
        fixedBg.style.filter = "blur(4px)";
    }
    document.body.style.backgroundColor = "#020617";
}

// 刷新所有可视化模块
function refreshAllModules() {
    renderArchive();
    drawMap();
    drawRadar();
    drawGraph();
    updateStats();
}

// 更新统计面板
function updateStats() {
    document.getElementById('totalCount').innerText = heritageData.length;
    const avg = (heritageData.reduce((s, h) => s + h.totalScore, 0) / heritageData.length).toFixed(1);
    document.getElementById('avgScore').innerText = avg;
}

// 1. 生动地图
function drawMap() {
    const chart = echarts.init(document.getElementById('mapChart'));
    const stats = heritageData.reduce((acc, curr) => { acc[curr.province] = (acc[curr.province] || 0) + 1; return acc; }, {});
    const mapData = Object.keys(geoCoordMap).map(p => ({ name: p, value: stats[p] || 0 }));

    chart.setOption({
        visualMap: { show: false, min: 0, max: Math.max(...Object.values(stats), 1), inRange: { color: ['#eff6ff', '#3b82f6', '#1d4ed8'] } },
        geo: { map: 'china', roam: false, center: [105, 36], zoom: 1.2, itemStyle: { normal: { areaColor: 'rgba(255,255,255,0.05)', borderColor: '#3b82f6' } } },
        series: [
            { type: 'map', geoIndex: 0, data: mapData },
            {
                type: 'effectScatter', coordinateSystem: 'geo',
                data: mapData.filter(d => d.value > 0).map(d => ({ name: d.name, value: [...geoCoordMap[d.name], d.value] })),
                symbolSize: v => v[2] * 7 + 10,
                rippleEffect: { brushType: 'stroke', scale: 3 },
                itemStyle: { color: '#3b82f6' },
                label: { show: true, position: 'right', formatter: '{b}', color: '#fff', fontWeight: 'bold' }
            }
        ]
    });

    chart.on('click', p => {
        const filtered = heritageData.filter(h => h.province.includes(p.name));
        document.getElementById('provinceDetailTitle').innerText = `${p.name} · 数据穿透`;
        document.getElementById('provinceList').innerHTML = filtered.map(h => `
            <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:border-blue-400 transition cursor-pointer" onclick="showModal(${h.id})">
                <div class="font-bold text-blue-100">${h.name}</div>
                <p class="text-[10px] text-slate-500 mt-1">${h.category} | 评分: ${h.totalScore}</p>
            </div>
        `).join('') || '<p class="text-slate-500 italic text-center py-10">该区域暂无数据</p>';
    });
}

// 2. 基因档案
function renderArchive() {
    const list = document.getElementById('heritageList');
    list.innerHTML = heritageData.map((h, i) => `
        <div class="archive-card-wrapper" style="animation-delay: ${i * 0.05}s" onclick="showModal(${h.id})">
            <div class="archive-card shadow-2xl">
                <div class="card-image-bg" style="background-image: url('${h.img}'); background-color: #1e293b; background-size: cover; background-position: center;"></div>
                <div class="card-info">
                    <span class="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full w-max mb-3 font-bold uppercase">${h.province}</span>
                    <h4 class="font-[ZCOOL XiaoWei] text-xl mb-1">${h.name}</h4>
                    <p class="text-xs opacity-70 line-clamp-2">${h.desc}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. 价值评估雷达
function drawRadar() {
    const radarChart = echarts.init(document.getElementById('radarChart'));
    const sel = document.getElementById('evalSelect');
    sel.innerHTML = heritageData.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
    
    const update = (id) => {
        const h = heritageData.find(x => x.id == id);
        radarChart.setOption({
            backgroundColor: 'transparent',
            radar: {
                indicator: [
                    {name:'传承度', max:100}, {name:'数字力', max:100},
                    {name:'传播力', max:100}, {name:'艺术价值', max:100},
                    {name:'活化潜力', max:100}
                ],
                splitArea: { show: false },
                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }
            },
            series: [{ 
                type: 'radar', 
                data: [{
                    value: [h.totalScore, h.totalScore-5, h.totalScore-10, h.totalScore+2, h.totalScore-8],
                    name: h.name
                }], 
                itemStyle:{color:'#10b981'}, 
                areaStyle:{opacity:0.3} 
            }]
        });
    };
    sel.onchange = (e) => update(e.target.value);
    update(heritageData[0].id);
}

// 4. 知识图谱
function drawGraph() {
    const chart = echarts.init(document.getElementById('graphChart'));

    const categoryColors = {
        '传统舞蹈': '#3b82f6',
        '传统戏剧': '#8b5cf6',
        '传统技艺': '#10b981',
        '传统音乐': '#f59e0b',
        '民俗': '#ef4444',
        '传统美术': '#ec4899',
        '民间文学': '#06b6d4'
    };

    const broadCategoryMap = {
        '传统音乐': '口头传统',
        '民间文学': '口头传统',
        '传统舞蹈': '仪式与表演',
        '民俗': '仪式与表演',
        '传统技艺': '手工艺与美术',
        '传统美术': '手工艺与美术',
        '传统戏剧': '戏剧艺术'
    };

    const nodes = heritageData.map(h => ({
        name: h.name,
        symbolSize: h.totalScore / 3 + 20,
        value: h.totalScore,
        category: h.category,
        itemStyle: {
            color: categoryColors[h.category] || '#3b82f6',
            borderColor: '#fff',
            borderWidth: 1,
            shadowBlur: 15,
            shadowColor: categoryColors[h.category] || '#3b82f6'
        },
        label: {
            show: true,
            color: '#fff',
            fontSize: 11,
            fontWeight: 'bold',
            textShadowBlur: 8,
            textShadowColor: '#000'
        },
        tooltipData: h
    }));

    const links = [];

    const fineCategoryGroups = {};
    heritageData.forEach(h => {
        if (!fineCategoryGroups[h.category]) fineCategoryGroups[h.category] = [];
        fineCategoryGroups[h.category].push(h.name);
    });
    Object.values(fineCategoryGroups).forEach(group => {
        if (group.length > 1) {
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    links.push({
                        source: group[i],
                        target: group[j],
                        lineStyle: { color: 'rgba(255,255,255,0.15)', width: 1.5, curveness: 0.2, type: 'solid' }
                    });
                }
            }
        }
    });

    const broadCategoryGroups = {};
    heritageData.forEach(h => {
        const broad = broadCategoryMap[h.category] || h.category;
        if (!broadCategoryGroups[broad]) broadCategoryGroups[broad] = [];
        broadCategoryGroups[broad].push(h.name);
    });
    Object.values(broadCategoryGroups).forEach(group => {
        if (group.length > 1) {
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    const alreadyConnected = links.some(link =>
                        (link.source === group[i] && link.target === group[j]) ||
                        (link.source === group[j] && link.target === group[i])
                    );
                    if (!alreadyConnected) {
                        links.push({
                            source: group[i],
                            target: group[j],
                            lineStyle: { color: 'rgba(255,255,255,0.08)', width: 1, curveness: 0.3, type: 'solid' }
                        });
                    }
                }
            }
        }
    });

    const topNodes = [...heritageData].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
    for (let i = 0; i < topNodes.length - 1; i++) {
        links.push({
            source: topNodes[i].name,
            target: topNodes[i + 1].name,
            lineStyle: { color: 'rgba(255,215,0,0.2)', width: 0.8, curveness: 0.3, type: 'dashed' }
        });
    }

    chart.setOption({
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                if (params.dataType === 'node') {
                    const h = params.data.tooltipData;
                    return `<strong>${h.name}</strong><br/>类别：${h.category}<br/>省份：${h.province}<br/>活化评分：${h.totalScore}`;
                }
                return '';
            },
            backgroundColor: 'rgba(15,23,42,0.9)',
            borderColor: '#3b82f6',
            textStyle: { color: '#fff' }
        },
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [{
            type: 'graph',
            layout: 'force',
            force: {
                repulsion: 500,
                edgeLength: [100, 250],
                gravity: 0.1,
                layoutAnimation: true
            },
            roam: true,
            draggable: true,
            focusNodeAdjacency: true,
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: 6,
            data: nodes,
            links: links,
            categories: Object.keys(categoryColors).map(cat => ({
                name: cat,
                itemStyle: { color: categoryColors[cat] }
            })),
            lineStyle: {
                color: 'source',
                curveness: 0.3,
                opacity: 0.5
            },
            emphasis: {
                focus: 'adjacency',
                lineStyle: {
                    width: 3,
                    opacity: 0.8,
                    shadowBlur: 10,
                    shadowColor: 'rgba(59,130,246,0.5)'
                },
                itemStyle: {
                    shadowBlur: 20,
                    shadowColor: 'rgba(59,130,246,0.8)',
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                label: {
                    fontSize: 13,
                    fontWeight: 'bold'
                }
            },
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 1,
                shadowBlur: 15,
                shadowColor: 'rgba(0,0,0,0.5)'
            }
        }]
    });

    window.addEventListener('resize', () => chart.resize());
}

// 5. 实时管理后台
function initDataManager() {
    const form = document.getElementById('dataInputForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            name: document.getElementById('newName').value,
            province: document.getElementById('newProvince').value,
            totalScore: parseInt(document.getElementById('newScore').value) || 85,
            desc: document.getElementById('newDesc').value,
            category: "新增录入",
            img: "img/背景.jpg"
        };
        heritageData.unshift(newItem);
        refreshAllModules();
        alert('同步成功！新基因已织入全站模型。');
        form.reset();
    };
}

// 6. 模块：AI 交互对话系统
function initChat() {
    var chatBox = document.getElementById('chatBox');
    var chatInput = document.getElementById('chatInput');
    var sendBtn = document.getElementById('sendChatBtn');

    if (!chatBox || !chatInput || !sendBtn) return;

    var chatHistory = [];
    var API_KEY = 'sk-86b27260d8544d84909b6a49adea6138';
    var API_URL = 'https://api.deepseek.com/chat/completions';
    var SYSTEM_PROMPT = '你是"西部陆海非遗大数据管理系统"的AI助手，面向非遗保护、传承、传播等问题给出专业、清晰、可执行的建议。默认先给出简洁完整的纯文本回答，控制在约150到300字；如果用户明确要求详细方案，再展开说明。请使用纯文本，不要使用Markdown。';

    function addMsg(text, isUser) {
        var placeholder = chatBox.querySelector('.text-white\\/40');
        if (placeholder) placeholder.remove();

        var div = document.createElement('div');
        div.className = isUser
            ? 'chat-bubble-user px-5 py-3 max-w-[75%] text-sm'
            : 'chat-bubble-ai px-5 py-3 max-w-[75%] text-sm';
        div.textContent = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function handleSend() {
        var userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMsg(userMessage, true);
        chatInput.value = '';
        sendBtn.disabled = true;

        chatHistory.push({ role: 'user', content: userMessage });

        var messages = [{ role: 'system', content: SYSTEM_PROMPT }]
            .concat(chatHistory.slice(-8));

        var xhr = new XMLHttpRequest();
        xhr.open('POST', API_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + API_KEY);
        xhr.timeout = 30000;

        xhr.onload = function() {
            try {
                var data = JSON.parse(xhr.responseText);
                if (xhr.status === 200 && data.choices && data.choices[0]) {
                    var reply = data.choices[0].message.content;
                    addMsg(reply, false);
                    chatHistory.push({ role: 'assistant', content: reply });
                } else {
                    var errMsg = (data.error && data.error.message) || 'API 调用失败';
                    addMsg('抱歉，AI 服务暂时不可用: ' + errMsg, false);
                }
            } catch(e) {
                addMsg('解析响应失败，请稍后重试', false);
            }
            sendBtn.disabled = false;
        };

        xhr.onerror = function() {
            addMsg('网络错误，请检查网络连接后重试', false);
            sendBtn.disabled = false;
        };

        xhr.ontimeout = function() {
            addMsg('请求超时，请稍后重试', false);
            sendBtn.disabled = false;
        };

        xhr.send(JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            stream: false,
            max_tokens: 2048,
            temperature: 0.7
        }));
    }

    sendBtn.onclick = handleSend;
    chatInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    addMsg('您好，我是非遗智脑。可以向我咨询任何非遗保护、传承策略、数字活化等问题。', false);
}

// 弹窗逻辑
window.showModal = (id) => {
    const h = heritageData.find(x => x.id == id);
    document.getElementById('modalTitle').innerText = h.name;
    document.getElementById('modalHeader').style.backgroundImage = `url('${h.img}')`;
    document.getElementById('modalContent').innerHTML = `
        <p class="font-bold text-blue-600 mb-4">${h.province} · ${h.category}</p>
        <p class="text-slate-600 leading-relaxed">${h.desc}</p>
    `;
    document.getElementById('modal').classList.remove('hidden');
};

document.getElementById('closeModal').onclick = () => document.getElementById('modal').classList.add('hidden');

// 启动
document.addEventListener('DOMContentLoaded', init);