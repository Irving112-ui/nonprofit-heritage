// netlify/functions/chat.js
function getProviderConfig() {
  const deepseekKey = (process.env.DEEPSEEK_API_KEY || "").trim().replace(/^['"]|['"]$/g, "");
  if (deepseekKey) {
    return {
      provider: "deepseek",
      apiKey: deepseekKey,
      baseUrl: (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, ""),
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      maxTokens: Number.parseInt(process.env.DEEPSEEK_MAX_TOKENS || "1024", 10) || 1024,
      requestTimeoutMs: Number.parseInt(process.env.DEEPSEEK_TIMEOUT_MS || "20000", 10) || 20000,
      debugEnabled: process.env.DEEPSEEK_DEBUG === "1",
    };
  }

  const zhipuKey = (process.env.ZHIPU_API_KEY || "").trim().replace(/^['"]|['"]$/g, "");
  if (zhipuKey) {
    return {
      provider: "zhipu",
      apiKey: zhipuKey,
      baseUrl: (process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn/api/paas/v4").replace(/\/+$/, ""),
      model: process.env.ZHIPU_MODEL || "glm-4.5-flash",
      maxTokens: Number.parseInt(process.env.ZHIPU_MAX_TOKENS || "2048", 10) || 2048,
      requestTimeoutMs: Number.parseInt(process.env.ZHIPU_TIMEOUT_MS || "25000", 10) || 25000,
      debugEnabled: process.env.ZHIPU_DEBUG === "1",
    };
  }

  throw new Error("Missing DEEPSEEK_API_KEY");
}

function logDebug(config) {
  if (!config.debugEnabled) return;
  const prefix = `[${config.provider} Debug]`;
  console.log(`${prefix} baseUrl:`, config.baseUrl);
  console.log(`${prefix} model:`, config.model);
  console.log(`${prefix} apiKeyLength:`, config.apiKey.length);
  console.log(`${prefix} apiKeyPrefix:`, config.apiKey.slice(0, 6));
  console.log(`${prefix} apiKeyHasSpace:`, /\s/.test(config.apiKey));
  console.log(`${prefix} requestTimeoutMs:`, config.requestTimeoutMs);
}

function buildRequestBody(config, messages, isPing) {
  const body = {
    model: config.model,
    messages,
    stream: false,
    max_tokens: isPing ? 16 : config.maxTokens,
  };

  // deepseek-reasoner 不支持 temperature / top_p，普通对话模型保留这两个参数。
  if (config.provider !== "deepseek" || config.model !== "deepseek-reasoner") {
    body.temperature = 0.7;
    body.top_p = 0.9;
  }

  return body;
}

function extractReply(config, data) {
  const messageObj = data?.choices?.[0]?.message || {};
  if (config.provider === "deepseek") {
    return (
      messageObj.content ||
      data?.choices?.[0]?.text ||
      data?.result ||
      ""
    );
  }

  return (
    messageObj.content ||
    messageObj.reasoning_content ||
    data?.choices?.[0]?.text ||
    data?.result ||
    ""
  );
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const isPing = body.mode === "ping" || body.action === "ping";
    const message = (body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message && !isPing) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing message" }) };
    }

    const config = getProviderConfig();
    logDebug(config);

    const safeHistory = history
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: String(item.content || "").slice(0, 2000),
      }))
      .filter((item) => item.content);

    const systemPrompt =
      "你是“西部陆海非遗大数据管理系统”的AI助手，面向非遗保护、传承、传播等问题给出专业、清晰、可执行的建议。默认先给出简洁完整的纯文本回答，控制在约150到300字；如果用户明确要求详细方案，再展开说明。请使用纯文本，不要使用Markdown。";

    const messages = [
      { role: "system", content: systemPrompt },
      ...(isPing ? [] : safeHistory.slice(-8)),
      { role: "user", content: isPing ? "ping" : message },
    ];

    const apiUrl =
      config.provider === "deepseek"
        ? `${config.baseUrl}/chat/completions`
        : `${config.baseUrl}/chat/completions`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs);

    let response;
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildRequestBody(config, messages, isPing)),
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("AI 响应超时，请稍后重试或让问题更简短一些");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    const dataText = await response.text();
    let data = {};
    try {
      data = JSON.parse(dataText);
    } catch {}

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          data?.error?.type ||
          dataText ||
          `${config.provider} API 调用错误`
      );
    }

    let reply = extractReply(config, data);

    if (!reply && isPing) {
      reply = "ok";
    }

    if (!reply) {
      console.error(`${config.provider} 空回复，响应原文:`, dataText);
      throw new Error("模型未返回有效内容");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply, ok: true, provider: config.provider }),
    };
  } catch (error) {
    console.error("AI 调用失败:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "AI 服务暂时不可用，请稍后重试" }),
    };
  }
};
