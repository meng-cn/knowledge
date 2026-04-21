# 10_Engineering/09 - 测试框架 Hypium

## 1. Hypium 概述

Hypium 是 HarmonyOS 官方提供的**单元测试和集成测试框架**，基于 Mocha 设计思路，为 ArkTS 应用提供测试基础设施。

### 1.1 Hypium 测试体系

| 测试类型 | 说明 | 运行环境 | 测试位置 |
|---------|------|---------|---------|
| **单元测试 (UT)** | 测试单个函数/方法 | 模拟器/真机 | `entry/ohosTest/` |
| **集成测试** | 测试模块间交互 | 模拟器/真机 | `entry/ohosTest/` |
| **E2E 测试** | 测试完整业务流程 | 真机/云测平台 | 外部工具 + Hypium |

### 1.2 Hypium vs Jest 对比

| 维度 | Hypium | Jest |
|------|--------|------|
| 运行环境 | 模拟器/真机 | Node.js |
| 断言 | `assert`, `expect` | `expect` |
| Mock | `hypium.mock` | `jest.mock` |
| 异步 | `async/await` | `async/await` |
| 覆盖率 | 支持 | 支持 |
| 并行测试 | 支持 | 支持 |
| Hook | `beforeEach`, `afterAll` | 相同 |

## 2. 环境配置

### 2.1 oh-package.json5 配置

```json5
// entry/oh-package.json5
{
  "devDependencies": {
    "@ohos/hypium": "1.0.16",
    "@ohos/hypium-assert": "1.0.0"
  }
}
```

### 2.2 Hypium 配置文件

```json5
// entry/hvigor/hypium_config.json
{
  "testSuite": [
    {
      "name": "unit_test",
      "testCases": [
        "test/unit.test.ets"
      ],
      "match": "**/*.test.ets"
    }
  ],
  "reporter": {
    "console": true,
    "file": true,
    "filePath": "hypium_report.json"
  },
  "coverage": {
    "enabled": true,
    "include": ["**/ets/**/*.ets"],
    "exclude": ["**/node_modules/**", "**/*.test.ets"]
  }
}
```

## 3. 单元测试示例

### 3.1 基础测试用例

```typescript
// entry/ohosTest/ets/test/unit.test.ets
import { describe, it, expect, beforeEach, afterEach } from '@ohos/hypium';
import { FormatUtils } from '../../src/main/ets/utils/Format.ets';
import { User } from '../../src/main/ets/model/User.ets';

describe('FormatUtils 单元测试', () => {
  beforeEach(() => {
    console.log('测试前准备');
  });

  afterEach(() => {
    console.log('测试后清理');
  });

  it('formatPrice 格式化价格', () => {
    const result = FormatUtils.formatPrice(123.45);
    expect(result).toBe('¥123.45');
  });

  it('formatPrice 处理整数', () => {
    const result = FormatUtils.formatPrice(100);
    expect(result).toBe('¥100.00');
  });

  it('formatPrice 处理零', () => {
    const result = FormatUtils.formatPrice(0);
    expect(result).toBe('¥0.00');
  });

  it('formatPrice 处理负数', () => {
    const result = FormatUtils.formatPrice(-50);
    expect(result).toBe('¥-50.00');
  });
});

describe('User 模型测试', () => {
  it('User 构造函数初始化', () => {
    const user = new User({ id: 1, name: '张三', email: 'zhangsan@example.com' });
    expect(user.id).toBe(1);
    expect(user.name).toBe('张三');
    expect(user.email).toBe('zhangsan@example.com');
  });

  it('User isValid 验证', () => {
    const user = new User({ id: 1, name: '', email: '' });
    expect(user.isValid()).toBe(false);
  });
});
```

### 3.2 异步测试

```typescript
import { describe, it, expect } from '@ohos/hypium';
import { HttpClient } from '../../src/main/ets/http/HttpClient.ets';
import { UserApi } from '../../src/main/ets/api/UserApi.ets';

describe('HttpClient 异步测试', () => {
  it('GET 请求返回数据', async () => {
    const client = new HttpClient();
    const result = await client.get<User>('/api/user/1');

    expect(result).not.toBe(null);
    expect(result?.id).toBeDefined();
    expect(typeof result?.name).toBe('string');
  });

  it('POST 请求创建用户', async () => {
    const client = new HttpClient();
    const newUser = await client.post<User>('/api/user', {
      name: '李四',
      email: 'lisi@example.com',
    });

    expect(newUser.id).toBeGreaterThan(0);
    expect(newUser.name).toBe('李四');
  });

  it('请求超时处理', async () => {
    const client = new HttpClient();
    try {
      await client.get('/api/slow-endpoint', { timeout: 100 });
      expect(false).toBe(true);  // 不应该到达这里
    } catch (error) {
      expect(error.code).toBe('TIMEOUT');
    }
  });
});
```

### 3.3 测试套件分组

```typescript
import { describe, beforeAll, afterAll } from '@ohos/hypium';

describe('AuthModule', () => {
  beforeAll(() => {
    console.log('认证模块测试 - 初始化');
    // 初始化认证环境
  });

  afterAll(() => {
    console.log('认证模块测试 - 清理');
    // 清理认证环境
  });

  describe('登录功能', () => {
    it('正常登录', () => { ... });
    it('用户名错误', () => { ... });
    it('密码错误', () => { ... });
  });

  describe('注册功能', () => {
    it('正常注册', () => { ... });
    it('邮箱已存在', () => { ... });
  });
});
```

## 4. Mock 测试

### 4.1 Mock 网络请求

```typescript
import { describe, it, expect } from '@ohos/hypium';
import { mock, MockObject } from '@ohos/hypium';

// Mock HttpClient
class MockHttpClient {
  get = mock.fn().mockResolvedValue({
    code: 200,
    data: { id: 1, name: 'MockUser' }
  });
  post = mock.fn().mockResolvedValue({
    code: 201,
    data: { id: 2, name: 'NewMockUser' }
  });
}

describe('UserApi Mock 测试', () => {
  it('通过 Mock 获取用户数据', async () => {
    const mockClient = new MockHttpClient() as MockObject<HttpClient>;
    const api = new UserApi(mockClient);
    const user = await api.getUser(1);

    expect(user.name).toBe('MockUser');
    expect(mockClient.get).toHaveBeenCalledWith('/api/user/1');
  });

  it('Mock 抛出异常', async () => {
    const mockClient = new MockHttpClient() as MockObject<HttpClient>;
    mockClient.get.mockRejectedValue(new Error('Network Error'));

    const api = new UserApi(mockClient);
    try {
      await api.getUser(1);
      expect.fail('应该抛出异常');
    } catch (error) {
      expect(error.message).toBe('Network Error');
    }
  });
});
```

### 4.2 Mock 系统服务

```typescript
import { describe, it, expect } from '@ohos/hypium';
import { mock, stub } from '@ohos/hypium';

describe('StorageService Mock 测试', () => {
  it('Mock storage.get', async () => {
    const mockStorage = mock.fn().mockResolvedValue('cached_user_id');
    stub(require('@kit.StorageKit'), 'storage', mockStorage);

    const result = await getUserFromStorage();
    expect(result).toBe('cached_user_id');
    expect(mockStorage.calledOnce).toBe(true);
  });

  it('Mock deviceInfo', async () => {
    const mockDeviceInfo = {
      getIMEI: mock.fn().mockResolvedValue('IMEI_12345'),
      getModel: mock.fn().mockResolvedValue('HUAWEI Mate 60'),
    };

    const result = await getDeviceInfo(mockDeviceInfo);
    expect(result.model).toBe('HUAWEI Mate 60');
  });
});
```

## 5. E2E 测试

### 5.1 Hypium E2E 测试框架

```typescript
import { describe, it, expect } from '@ohos/hypium';
import { element, device, window } from '@ohos/hypium';

describe('E2E 测试 - 登录流程', () => {
  it('完整登录流程', async () => {
    // 1. 打开应用
    await device.launchApp('com.example.myapp');

    // 2. 等待首页加载
    await device.waitForElement(element('IndexPage'), 5000);

    // 3. 点击登录按钮
    await device.click(element('LoginButton'));

    // 4. 等待登录页出现
    await device.waitForElement(element('LoginPage'), 3000);

    // 5. 输入用户名
    await device.inputText(element('UsernameInput'), 'testuser');

    // 6. 输入密码
    await device.inputText(element('PasswordInput'), 'password123');

    // 7. 点击登录按钮
    await device.click(element('SignInButton'));

    // 8. 等待首页加载完成
    await device.waitForElement(element('HomePage'), 5000);

    // 9. 验证用户信息
    const userInfo = await device.findElement(element('UserInfoText'));
    expect(userInfo.text).toContain('testuser');
  });
});

describe('E2E 测试 - 搜索功能', () => {
  it('搜索商品', async () => {
    await device.launchApp('com.example.myapp');

    // 1. 进入搜索页
    await device.click(element('SearchButton'));
    await device.waitForElement(element('SearchInput'), 3000);

    // 2. 输入搜索关键词
    await device.inputText(element('SearchInput'), '华为手机');

    // 3. 点击搜索
    await device.click(element('SearchSubmitButton'));

    // 4. 等待结果
    await device.waitForElement(element('SearchResultList'), 5000);

    // 5. 验证结果
    const results = await device.findAllElements(element('SearchResultItem'));
    expect(results.length).toBeGreaterThan(0);
  });
});
```

### 5.2 E2E 测试命令

```bash
# 运行单元测试
hvigorw testApp

# 运行所有测试
hvigorw testApp --suite=unit_test

# 生成覆盖率报告
hvigorw testApp --coverage

# 运行指定测试文件
hvigorw testApp --filter=login
```

## 6. 测试覆盖率

### 6.1 覆盖率配置

```json5
// hvigor/hypium_config.json
{
  "coverage": {
    "enabled": true,
    "include": ["**/ets/**/*.ets"],
    "exclude": [
      "**/*.test.ets",
      "**/node_modules/**",
      "**/mock/*.ets",
      "**/model/*.ets"  // 纯数据模型通常不测
    ],
    "reporters": ["html", "lcov", "json"],
    "outputDir": "./coverage"
  }
}
```

### 6.2 覆盖率报告格式

```
Coverage Report:
┌──────────────────────────────┬────────┬──────────┐
│ File                         │ Lines  │ Branches │
├──────────────────────────────┼────────┼──────────┤
│ FormatUtils.ets              │ 95.2%  │ 87.5%    │
│ UserApi.ets                  │ 82.1%  │ 70.0%    │
│ UserService.ets              │ 91.3%  │ 85.0%    │
│ HomePage.ets                 │ 75.0%  │ 60.0%    │
│ LoginPage.ets                │ 88.5%  │ 80.0%    │
│ ─────────────────────────────┼────────┼──────────┤
│ TOTAL                        │ 85.4%  │ 76.2%    │
└──────────────────────────────┴────────┴──────────┘
```

## 7. 面试高频考点

### Q1: Hypium 测试框架的组成？

> **回答要点**：
> - `describe` / `it` 定义测试套件和测试用例
> - `expect` / `assert` 提供断言
> - `beforeEach` / `afterEach` / `beforeAll` / `afterAll` 生命周期
> - `mock` / `stub` 提供 Mock 能力
> - 支持 async/await 异步测试

### Q2: 如何 Mock 网络请求？

> **回答要点**：
> - 使用 `mock.fn()` 创建 Mock 函数
- 使用 `mockResolvedValue` / `mockRejectedValue` 模拟返回值
- 通过 `stub` 替换模块依赖
- 在测试前配置 Mock，测试后恢复

### Q3: 单元测试覆盖率如何计算？

> **回答要点**：
> - Hypium 通过字节码插桩统计行覆盖和分支覆盖
- `coverage` 配置中包含/排除的文件路径
- 输出 HTML/LCOV/JSON 格式报告
- 业界建议核心业务逻辑覆盖率 ≥ 80%

## 8. Android 对比

| 概念 | Android | HarmonyOS |
|------|---------|-----------|
| 单元测试 | JUnit 4/5 | Hypium |
| Mock 框架 | Mockito | hypium.mock |
| E2E 测试 | Espresso | Hypium + device API |
| 覆盖率 | Jacoco | Hypium coverage |
| 测试运行 | JUnitRunner | hvigorw testApp |
| 断言 | `assertEquals` | `expect().toBe()` |
