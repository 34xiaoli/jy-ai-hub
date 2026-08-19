# session_id: b12d17ce-0c54-4a2b-9cc7-835bcb7bb434
classes: {
  zone_1: {
    style: {
      fill: "#F0F5FE"
      stroke: "#4185EE"
      font-color: "#333333"
      border-radius: 8
    }
  }
  zone_2: {
    style: {
      fill: "#F2F7FE"
      stroke: "#4185EE"
      font-color: "#333333"
      border-radius: 8
    }
  }
  zone_3: {
    style: {
      fill: "#F6F9FE"
      stroke: "#4185EE"
      font-color: "#333333"
      border-radius: 8
    }
  }
  zone_4: {
    style: {
      fill: "#F9FBFE"
      stroke: "#4185EE"
      font-color: "#333333"
      border-radius: 8
    }
  }
  zone_5: {
    style: {
      fill: "#FCFDFF"
      stroke: "#4185EE"
      font-color: "#333333"
      border-radius: 8
    }
  }
  entity: {
    style: {
      fill: "#FFFFFF"
      stroke: "#1F2937"
      font-color: "#333333"
      border-radius: 6
      shadow: true
    }
  }
  signal: {
    style: {
      fill: transparent
      font-color: "#6B7280"
    }
  }
}

direction: down

合规底座: {
  class: zone_1

  数据本地化部署: Ollama + Qwen/DeepSeek
  敏感数据不出境

  用户接入层: {
    class: zone_2
    direction: down
    审计项目组: {
      direction: right
      项目合伙人
      项目经理
      审计助理
    }
  }

  平台层: {
    class: zone_3
    飞书Aily平台: {
      direction: right
      对话入口
      知识空间授权
    }
  }

  智能体层: {
    class: zone_4
    主智能体: 凯桥数智合伙人主智能体 {
      style.shadow: true
      style.bold: true
    }
    子智能体组: {
      direction: right
      风控智能体
      审计参谋
      审计文书主笔
    }
  }

  能力服务层: {
    class: zone_5
    FastAPI后端服务
    V11系统综合底稿数据
    专业术语库
    数据脱敏工具
  }

  知识底座层: {
    class: zone_5
    direction: right
    L1法规库KQ_001
    L2准则库KQ_002
    L3实务库
    L4数据库
  }

  # 用户接入层 -> 平台层
  用户接入层.审计项目组 -> 平台层.飞书Aily平台: 对话

  # 平台层 -> 智能体层
  平台层.飞书Aily平台 -> 智能体层.主智能体: 对话

  # 主智能体编排调度三个子智能体
  智能体层.(主智能体 -> 子智能体组): 编排调度

  # 子智能体调用能力服务层
  智能体层.子智能体组.风控智能体 -> 能力服务层.FastAPI后端服务: 风险评估
  智能体层.子智能体组.审计参谋 -> 能力服务层.专业术语库: 审计咨询
  智能体层.子智能体组.审计文书主笔 -> 能力服务层.V11系统综合底稿数据: 文书撰写

  # 智能体统一检索知识底座
  智能体层 -> 知识底座层: 统一检索 L1-L4
}