# ExtensionAbility

> 面向特定场景的非 UI 主入口组件，如卡片、后台任务、输入法等。

---

## 1. ExtensionAbility 概述

### 1.1 概念

ExtensionAbility 是 **Stage 模型中面向特定场景的组件**，不需要 UI 界面，运行在独立的受限环境中。

### 1.2 核心用途

| 场景 | ExtensionAbility 类型 |
|---|-|
| 桌面卡片 | `FormExtensionAbility` |
| 后台任务 | `WorkSchedulerExtension` |
| 输入法 | `InputMethodExtension` |
| 音频播放 | `AudioExtensionAbility` |
| 文件管理 | `FileViewExtensionAbility` |
| 内容提供 | `ContentProvider` |
| 壁纸 | `WallpaperExtensionAbility` |

---

## 2. FormExtensionAbility（桌面卡片）⭐

### 2.1 卡片生命周期

```
卡片创建 → 卡片更新 → 卡片交互 → 卡片销毁
```

### 2.2 完整实现

```typescript
// form/FormAbility.ets
import { formInfo, formBindingData } from '@kit.FormKit';
import { BusinessError } from '@kit.BasicServicesKit';

export default class FormAbility extends formExtensionAbility {
    // 卡片创建时调用
    onFormCreate(formId: string): void {
        console.info(`FormAbility onFormCreate: formId=${formId}`)
        
        // 初始化卡片数据
        this.updateForm(formId)
    }

    // 卡片更新时调用（可定期更新或手动触发）
    onFormUpdate(formId: string): void {
        console.info(`FormAbility onFormUpdate: formId=${formId}`)
        
        // 获取卡片配置
        let config = this.getFormSetting(formId)
        
        // 更新卡片数据
        this.updateForm(formId, config)
    }

    // 卡片点击时调用
    onFormClick(formId: string): void {
        console.info(`FormAbility onFormClick: formId=${formId}`)
        
        // 启动对应的 Ability
        let want = {
            bundleName: context.packageName,
            abilityName: 'EntryAbility'
        }
        context.startAbility(want)
    }

    // 卡片销毁时调用
    onFormDelete(formId: string): void {
        console.info(`FormAbility onFormDelete: formId=${formId}`)
        // 清理卡片相关数据
    }

    // 销毁卡片实例
    onDisable(formId: string): void {
        console.info(`FormAbility onDisable: formId=${formId}`)
    }

    // 卡片数据更新
    updateForm(formId: string, config?: formInfo.FormConfig): void {
        // 获取模板信息
        let template = this.getTemplate(formId)
        
        // 准备数据
        let data = this.getFormDataSource(formId)
        
        // 渲染卡片
        formBindingData.doTemplateBinding(data, template).then((formBindingData) => {
            this.updateFormBindingData(formId, formBindingData)
        }).catch((err: BusinessError) => {
            console.error(`FormAbility updateFormBindingData failed: ${err.message}`)
        })
    }

    // 获取卡片数据源
    getFormDataSource(formId: string): formBindingData.FormDataSource {
        let dataSource = new formBindingData.FormDataSource()
        
        // 设置卡片显示的数据
        let time = new Date().toLocaleTimeString()
        let weather = '晴天'
        let temperature = 25
        
        dataSource.setParam('time', time)
        dataSource.setParam('weather', weather)
        dataSource.setParam('temperature', temperature.toString())
        
        return dataSource
    }
}
```

### 2.3 module.json5 配置

```json5
{
  "module": {
    "abilities": [
      {
        "name": "FormAbility",
        "srcEntry": "./ets/form/FormAbility.ets",
        "type": "form",
        "metadata": [
          {
            "name": "form-config",
            "resource": "$profile:form_config"
          }
        ]
      }
    ]
  }
}
```

### 2.4 form_config.json 配置

```json5
{
  "formConfigs": [
    {
      "name": "WeatherForm",
      "tagName": "WeatherForm",
      "window": {
        "width": 300,
        "height": 100,
        "configMode": "custom"
      }
    },
    {
      "name": "ClockForm",
      "tagName": "ClockForm",
      "window": {
        "width": 200,
        "height": 200,
        "configMode": "custom"
      }
    }
  ]
}
```

---

## 3. WorkSchedulerExtension（后台任务）⭐

### 3.1 使用场景

- 定时数据同步
- 后台下载任务
- 定期更新缓存
- 心跳检测

### 3.2 完整实现

```typescript
// scheduler/SchedulerAbility.ets
import { workScheduler, workInfo, schedulerType, scheduleMode } from '@kit.WorkSchedulerKit';
import { BusinessError } from '@kit.BasicServicesKit';

export default class SchedulerAbility extends workSchedulerExtensionAbility {
    
    // 注册定时任务
    registerTask(): void {
        let taskInfo: workInfo.TaskInfo = {
            name: 'dataSyncTask',
            type: schedulerType.DECIDED,  // DECIDED/WALL_CLOCK
            scheduler: {
                period: 3600000,  // 1 小时后执行
                alignWindow: 1000,  // 容差窗口 1s
                expireTime: 7200000  // 2 小时后过期
            }
        }

        let want = {
            bundleName: context.packageName,
            abilityName: 'SchedulerAbility',
            parameters: {
                taskId: 'dataSyncTask'
            }
        }

        workScheduler.schedule(want, taskInfo).then((taskId: string) => {
            console.info('Schedule success, taskId: ' + taskId)
        }).catch((err: BusinessError) => {
            console.error('Schedule failed: ' + err.message)
        })
    }

    // 执行定时任务
    onStart(want: Want): void {
        let taskId = want.parameters['taskId'] as string
        
        if (taskId === 'dataSyncTask') {
            // 执行数据同步逻辑
            this.doDataSync()
        }
    }

    // 数据同步
    doDataSync(): void {
        console.info('Syncing data...')
        // 网络请求、数据更新等
    }

    // 取消定时任务
    cancelTask(): void {
        workScheduler.cancel('dataSyncTask').then(() => {
            console.info('Task cancelled')
        }).catch((err: BusinessError) => {
            console.error('Cancel failed: ' + err.message)
        })
    }
}
```

---

## 4. InputMethodExtension（输入法）

### 4.1 实现框架

```typescript
// input/InputMethodAbility.ets
import { InputMethodExtensionAbility } from '@kit.InputMethodKit';
import { InputMethodEngine } from '@kit.InputMethodKit';

export default class InputMethodAbility extends InputMethodExtensionAbility {
    onCreate(): void {
        console.info('InputMethodAbility onCreate')
    }

    onStartEngine(): InputMethodEngine {
        console.info('InputMethodAbility onStartEngine')
        return new MyInputMethodEngine()
    }

    onDestroy(): void {
        console.info('InputMethodAbility onDestroy')
    }
}

// 自定义输入法引擎
class MyInputMethodEngine extends InputMethodEngine {
    onStartInputView(editorInfo: any, startCaps: boolean): void {
        // 输入框创建
    }

    onUpdateInputView(): void {
        // 输入框更新
    }

    onStartInput(editorInfo: any, restart: boolean): void {
        // 输入开始
    }

    onFinishInput(): void {
        // 输入结束
    }

    onHidden(): void {
        // 输入法隐藏
    }
}
```

---

## 5. ExtensionAbility 的生命周期

```
ExtensionAbility 创建
    ↓
onCreate() → 初始化
    ↓
onStartEngine() / onStart() → 启动
    ↓
功能运行（持续）
    ↓
onDisable() / onDestroy() → 销毁
```

---

## 6. ExtensionAbility vs UIAbility 对比

| 特性 | UIAbility | ExtensionAbility |
|---|-|-|
| **UI 界面** | ✅ 有 | ❌ 无 |
| **主入口** | ✅ 是 | ❌ 不是 |
| **用户可见** | ✅ 是 | ❌ 不可见 |
| **启动方式** | 用户/系统 | 系统/框架 |
| **典型场景** | 页面、功能 | 卡片、后台、输入法 |
| **生命周期** | 完整周期 | 受限周期 |

---

## 7. 面试高频考点

### Q1: ExtensionAbility 有哪些类型？

**回答**：FormExtension（卡片）、WorkSchedulerExtension（后台任务）、InputMethodExtension（输入法）等。面向特定场景，无 UI。

### Q2: 卡片的基本流程？

**回答**：onFormCreate（创建）→ onFormUpdate（更新）→ onFormClick（点击）→ onFormDelete（删除）。通过 module.json5 配置 form 类型。

---

> 🐱 **小猫提示**：ExtensionAbility 记住 **"无 UI、面向特定场景、卡片/后台/输入法"**。卡片开发是鸿蒙特色功能。
