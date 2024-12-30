# Entity Relationship Diagram

This ERD is automatically generated from the Prisma schema.

```mermaid
erDiagram

  %% User: 系统用户表
  User {
    id String "PK"
  }

  %% Workspace: 工作空间表
  Workspace {
    id String "PK"
    name String
  }

  %% PaymentUser: 支付用户表
  PaymentUser {
    id String "PK"
    userId String
    email String "U"
    paymentPlatform PaymentPlatform
    customerId String "O U"
    payments Payment
    creditRecords CreditRecord
    createdAt DateTime
    updatedAt DateTime
  }

  %% Payment: 支付记录表
  Payment {
    id String "PK"
    amount Float
    currency String
    status PaymentStatus
    paymentPlatform PaymentPlatform
    paymentId String "U"
    paymentUserId String
    paymentUser PaymentUser
    createdAt DateTime
    updatedAt DateTime
  }

  %% Subscription: 订阅表
  Subscription {
    id String "PK"
    paymentPlatform PaymentPlatform
    subscriptionId String "U"
    status SubscriptionStatus
    workspaceId String "U"
    workspace Workspace
    plan PlanType
    startDate DateTime
    endDate DateTime
    createdAt DateTime
    updatedAt DateTime
  }

  %% FeatureUsage: 功能使用情况表
  FeatureUsage {
    id String "PK"
    workspaceId String
    workspace Workspace
    featureCode String
    used Float
    createdAt DateTime
    updatedAt DateTime
  }

  %% Credit: 充值余额表
  Credit {
    id String "PK"
    workspaceId String "U"
    workspace Workspace
    balance Float
    total Float
    totalUsage Float
    createdAt DateTime
    updatedAt DateTime
  }

  %% CreditRecord: 充值记录表
  CreditRecord {
    id String "PK"
    amount Float
    type CreditType
    workspaceId String
    workspace Workspace
    paymentUserId String
    paymentUser PaymentUser
    paymentId String "O U"
    payment Payment "O"
    description String "O"
    createdAt DateTime
    updatedAt DateTime
  }

  %% CreditUsage: 充值使用记录表
  CreditUsage {
    id String "PK"
    workspaceId String
    workspace Workspace
    featureCode String
    amount Float
    description String
    status UsageStatus
    createdAt DateTime
    updatedAt DateTime
  }

  %% AIUsage: AI 使用记录表
  AIUsage {
    id String "PK"
    workspaceId String
    workspace Workspace
    pageId String
    type AIUsageType
    points Int
    freePoints Int
    description String "O"
    createdAt DateTime
    updatedAt DateTime
  }

  %% Enums
  PaymentStatus {
    type ENUM "PENDING            // 支付待处理|SUCCEEDED          // 支付成功|FAILED             // 支付失败"
  }

  SubscriptionStatus {
    type ENUM "ACTIVE          // 订阅激活中|CANCELED        // 订阅已取消|PAST_DUE        // 订阅已逾期|UNPAID          // 订阅未支付|TRIAL           // 试用期"
  }

  PlanType {
    type ENUM "FREE                // 免费版计划|BASIC               // 基础版计划|PRO                 // 专业版计划|ENTERPRISE          // 企业版计划"
  }

  PaymentPlatform {
    type ENUM "STRIPE              // Stripe支付平台"
  }

  UsageStatus {
    type ENUM "SUCCEEDED          // 扣费成功|FAILED             // 扣费失败（余额不足）|REFUNDED           // 已退还"
  }

  CreditType {
    type ENUM "PURCHASE            // 购买充值"
  }

  AIUsageType {
    type ENUM "TEXT_CHAT           // 文字对话|IMAGE_GENERATION    // 图片生成"
  }


```

## Legend

### Field Attributes
- PK: Primary Key
- U: Unique
- O: Optional (Nullable)
- D: Default Value

### Relationships
- ||--||: One-to-One
- ||--o{: One-to-Many

### Notes
- Model comments are shown as %% comments
- Enum types are shown as separate entities
