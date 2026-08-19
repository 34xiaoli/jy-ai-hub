# DeepSeek 纯文本模型多模态协同 · 实现手册

> 适用模型：deepseek-v4-flash（含 0731 版）/ deepseek-v4-pro
> 场景：Claude Code（本地代理→DeepSeek）、WorkBuddy、FastAPI 自建服务
> 更新：2026-08-11

---

## 0. 方案总览与选型

| 方案 | 一句话 | 适用 | 数据出境 | 成本 | 难度 |
|---|---|---|---|---|---|
| A. Vision Skill 桥接 | 编程工具装视觉 skill，图片转文字再交 DeepSeek | 截图 / UI / 日常看图 | 是（Qwen API） | 几厘/张 | 低 |
| B. 本地视觉网关 | Ollama 跑视觉模型 + FastAPI 网关，全程离线 | 涉密 / 审计底稿图片 | 否 | 电费 | 中 |
| C. OCR→DeepSeek | OCR 抽字段，DeepSeek 做结构化校验 | 凭证 / 发票 / 回单 | 视 OCR 部署 | 低 | 中 |
| D. 官方 OCR 参数 | DeepSeek 文档接口自带 `document_preprocess_mode` | 扫描件 PDF / 合同 / 函证 | 否 | 0 | 零 |

**选型口诀**：字段抽取用 C，涉密用 B，日常看图用 A，扫描件用 D。

---

## 1. 方案 A：Vision Skill 桥接（Claude Code）

### 1.1 安装

```bash
# 进入 Claude Code 项目或全局 skills 目录
cd ~/.claude
git clone https://github.com/asuojun/claude-vision-skill.git skills/vision
```

> 社区同类替代：`wshobson/agents`（vision 子 skill）、自写 SKILL.md（见 1.3）。

### 1.2 配置视觉模型（阿里云百炼，成本几厘/张）

1. 注册阿里云百炼（dashscope），开通"通义千问 Qwen-VL"系列
2. 获取 API Key
3. 写入环境变量：

```bash
export DASHSCOPE_API_KEY="sk-xxxxxxxx"
```

模型选型：
- 性价比：`qwen-vl-plus` 或 `qwen3.7-flash`（识图 0.0004~0.001 元/张）
- 更强：`qwen3.8-max`

### 1.3 SKILL.md 骨架（自建版本）

```markdown
---
name: vision
description: 当用户提供图片/截图/UI/凭证等视觉任务时使用。将图片发送给视觉模型转文字描述，再交回主模型推理。
---

# Vision Skill

## 触发条件
用户上传图片、截图，或要求"看这张图""分析界面""识别票据"时。

## 执行步骤
1. 获取图片路径（本地文件或 URL）
2. 调用视觉模型 API，图片转 Base64 发送
3. 提示词模板：「请逐项列出图中的全部文字、关键字段、数字与布局」
4. 将返回的文字描述作为上下文，交回主模型完成推理
5. 关键字段标注「来源于视觉模型，需人工复核」

## 配置
- VISION_API_KEY：阿里云百炼 Key
- VISION_MODEL：qwen-vl-plus / qwen3.7-flash
```

### 1.4 核心调用代码（Python）

```python
# vision_bridge.py — 图片 → 视觉模型 → 文字描述
import base64, os, requests

def image_to_text(image_path: str,
                  prompt: str = "请逐项列出图中所有文字、数字与关键信息") -> str:
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    resp = requests.post(
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
        headers={"Authorization": f"Bearer {os.environ['DASHSCOPE_API_KEY']}"},
        json={
            "model": os.environ.get("VISION_MODEL", "qwen-vl-plus"),
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "image_url",
                     "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                    {"type": "text", "text": prompt},
                ],
            }],
        },
        timeout=60,
    )
    return resp.json()["choices"][0]["message"]["content"]

if __name__ == "__main__":
    print(image_to_text("screenshot.png"))
```

### 1.5 验证

```bash
python vision_bridge.py 你的截图.png
# 期望输出：图片中所有文字/数字的结构化描述，而非"无法识别"
```

---

## 2. 方案 B：本地多模态网关（数据不出机）

### 2.1 安装 Ollama 并拉取视觉模型

```bash
# Windows 安装：https://ollama.com/download/windows
ollama pull llava:latest        # 轻量，通用
ollama pull qwen2.5-vl:7b       # 中文更强，推荐审计场景
ollama pull minicpm-v:8b        # 文档/表格识别较好
# 验证
curl http://localhost:11434/api/tags
```

### 2.2 FastAPI 本地视觉网关

```python
# vision_gateway.py — 本地视觉网关，全程离线
from fastapi import FastAPI, UploadFile
import base64, httpx

app = FastAPI()
OLLAMA_URL = "http://localhost:11434"
VISION_MODEL = "qwen2.5-vl:7b"   # 按需切换

@app.post("/describe")
async def describe(file: UploadFile,
                   prompt: str = "请逐项列出图中所有文字与关键信息"):
    img = await file.read()
    b64 = base64.b64encode(img).decode()
    resp = httpx.post(
        f"{OLLAMA_URL}/api/generate",
        json={"model": VISION_MODEL,
              "prompt": prompt,
              "images": [b64],
              "stream": False},
        timeout=120,
    )
    return {"text": resp.json()["response"]}
```

```bash
pip install fastapi uvicorn httpx
uvicorn vision_gateway:app --host 127.0.0.1 --port 8000
curl -X POST http://127.0.0.1:8000/describe -F "file=@test.jpg"
```

### 2.3 接入 Claude Code（可选）

把网关暴露成一个极简 MCP stdio server，或在 prompt 里让 Agent 用 `curl` 调本地端口即可。最简做法：写一个 `describe_image.py` CLI 脚本，Claude Code 直接执行。

```python
# describe_image.py — CLI 封装
import sys, base64, httpx

img = sys.argv[1]
b64 = base64.b64encode(open(img, "rb").read()).decode()
r = httpx.post("http://127.0.0.1:8000/describe",
               json={"image_b64": b64}, timeout=120)
print(r.json()["text"])
```

> 说明：涉密场景推荐"本地视觉网关 + DeepSeek API"两段式——图片不出机，只有 OCR/描述文本进入推理。

---

## 3. 方案 C：OCR → DeepSeek 凭证流水线（最稳）

### 3.1 安装 RapidOCR（轻量，CPU 可跑）

```bash
pip install rapidocr-onnxruntime
# 或 PaddleOCR（精度更高，依赖更重）
pip install paddleocr paddlepaddle
```

### 3.2 识别 + 结构化脚本

```python
# invoice_ocr.py — 凭证/发票字段抽取
from rapidocr_onnxruntime import RapidOCR
import json, os, requests

ocr = RapidOCR()

def extract_fields(image_path: str) -> dict:
    result, _ = ocr(image_path)
    lines = [item[1] for item in result] if result else []
    text = "\n".join(lines)

    resp = requests.post(
        "https://api.deepseek.com/chat/completions",
        headers={"Authorization": f"Bearer {os.environ['DEEPSEEK_API_KEY']}"},
        json={
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": f"""从以下OCR文本中抽取发票字段，只输出JSON：
{{
  "发票代码": "", "发票号码": "", "开票日期": "",
  "金额": "", "税额": "", "价税合计": "",
  "销售方名称": "", "销售方税号": "",
  "购买方名称": "", "商品名称": ""
}}
OCR文本：
{text}"""}],
            "response_format": {"type": "json_object"},
        },
        timeout=60,
    )
    return json.loads(resp.json()["choices"][0]["message"]["content"])

if __name__ == "__main__":
    import sys
    print(json.dumps(extract_fields(sys.argv[1]), ensure_ascii=False, indent=2))
```

### 3.3 审计场景扩展

- 银行回单：字段换成"交易日期/金额/收付方向/对方户名/摘要"
- 记账凭证：字段换成"科目/借贷方向/金额/附件数"
- 校验规则（防幻觉）：OCR 金额 与 模型输出 数值比对，不一致打「⚠️复核」标记

---

## 4. 方案 D：DeepSeek 官方 OCR 参数（扫描件 PDF）

社区抓包发现的未公开参数，扫描件类 PDF 强烈建议：

```python
resp = client.chat.completions.create(
    model="deepseek-v4-flash-0731",   # 或 deepseek-chat
    messages=[{"role": "user", "content": "请提取这份扫描合同中的关键条款"}],
    extra_body={
        "document_preprocess_mode": "ocr_only",  # auto | ocr_only | text_only
        "ocr_dpi_threshold": 180,                # 默认150，扫描件提到180
    },
)
```

| 参数 | 取值 | 说明 |
|---|---|---|
| document_preprocess_mode | `auto`（默认） | 先文本后 OCR，扫描件会错过增强时机 |
| | `ocr_only` | 强制 OCR，扫描件推荐 |
| | `text_only` | 纯文本，速度快 |
| ocr_dpi_threshold | 默认 150 | 提到 180 识别率 90.3%→98.6%，单页 +1.8s |
| | 不建议 240+ | 内存翻倍，并发超时率上升 |

---

## 5. 落地顺序（结合你的环境）

| 阶段 | 动作 | 耗时 | 说明 |
|---|---|---|---|
| 阶段 1（今天） | 方案 D 参数 + 方案 A 装 skill | 30 分钟 | 零/极低成本，立即可用 |
| 阶段 2（本周） | 方案 C 凭证识别流水线 | 半天 | 直接服务底稿项目 |
| 阶段 3（涉密项目） | 方案 B 本地网关 | 半天 | 数据不出机 |
| 持续 | 把方案 A/B 封装为 Claude Code / Aily skill | 按需 | 沉淀为团队能力 |

---

## 6. 关键提醒

1. **数据本地化是底线**：涉密底稿图片必须走方案 B；凭证字段可用方案 C（OCR 本地跑，只上传文本字段）
2. **防幻觉**：视觉模型/OCR 输出的关键数值，必须与源数据比对，不一致打复核标记（呼应你的审计质量控制要求）
3. **成本**：方案 A 单张几厘钱，方案 B/C 为 0，方案 D 为 0——先 D，再 A，需要精确字段再上 C
4. **模型选型别纠结**：日常看截图 qwen3.7-flash 足够；文档表格多 qwen2.5-vl 本地更稳
