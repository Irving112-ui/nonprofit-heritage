// netlify/functions/chat.js
exports.handler = async function(event, context) {
  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { message } = JSON.parse(event.body);
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing message' }),
      };
    }

    // 从环境变量读取密钥
    const API_KEY = process.env.BAIDU_API_KEY;
    const SECRET_KEY = process.env.BAIDU_SECRET_KEY;

    // 1. 获取 access_token
    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('获取 access_token 失败');
    }

    // 2. 调用文心一言 API（以 ERNIE 4.5 Turbo 为例）
    const model = 'ERNIE-4.5-Turbo';  // 根据你实际选的模型修改
    const apiUrl = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${model}?access_token=${accessToken}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
      }),
    });

    const data = await response.json();
    if (data.error_code) {
      throw new Error(data.error_msg || 'API 调用错误');
    }

    const reply = data.result;
    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error('AI 调用失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI 服务暂时不可用，请稍后重试' }),
    };
  }
}
