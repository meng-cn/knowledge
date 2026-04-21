# Want 意图

> Want 是鸿蒙组件间通信的载体，用于启动 Ability、传递参数、隐式跳转。

---

## 1. Want 基本结构

```typescript
interface Want {
    action: string           // 动作
    entities: string[]       // 实体类型
    data: string             // 数据 URI
    type: string             // MIME 类型
    flags: AbilityFlags      // 标志位
    parameters: Record<string, Object>  // 参数
    bundleName: string       // 目标包名
    abilityName: string      // 目标 Ability 名
    deviceId: string         // 目标设备 ID
    moduleName: string       // 目标模块名
    uri: string              // URI
}
```

---

## 2. 显式 Want（指定目标）

### 2.1 启动指定 Ability

```typescript
// 显式启动：直接指定目标
let want = {
    bundleName: 'com.example.app',      // 目标包名
    abilityName: 'TargetAbility'         // 目标 Ability 名
}

this.context.startAbility(want).then(() => {
    console.log('启动成功')
}).catch((err) => {
    console.error('启动失败:', err.message)
})
```

### 2.2 显式传递参数

```typescript
let want = {
    bundleName: 'com.example.app',
    abilityName: 'DetailAbility',
    parameters: {
        userId: '12345',
        title: '用户详情',
        extraData: JSON.stringify({ key: 'value' })
    }
}

this.context.startAbility(want)
```

### 2.3 获取返回结果

```typescript
let want = {
    bundleName: 'com.example.app',
    abilityName: 'ResultAbility',
    parameters: {
        action: 'getData'
    }
}

// startAbilityForResult 获取返回结果
this.context.startAbilityForResult(want).then((result) => {
    let data = result.want?.parameters['result']
    console.log('结果:', data)
})
```

---

## 3. 隐式 Want（不指定目标）

### 3.1 发送方

```typescript
// 不指定具体目标，由系统匹配
let want = {
    action: 'com.example.app.action.VIEW',  // 动作
    entities: ['entity.system.default'],      // 实体
    type: 'text/plain',                       // MIME 类型
    parameters: {
        url: 'https://example.com'
    }
}

this.context.startAbility(want)
```

### 3.2 接收方（配置 skills）

```json5
// module.json5
"abilities": [
  {
    "name": "ViewerAbility",
    "srcEntry": "./ets/viewer/ViewerAbility.ets",
    "launchType": "standard",
    "skills": [
      {
        "entities": ["entity.system.default"],
        "actions": [
          "com.example.app.action.VIEW"
        ],
        "uris": [
          {
            "scheme": "https",
            "host": "example.com",
            "pathPrefix": "/"
          }
        ]
      }
    ]
  }
]
```

---

## 4. Want 的常用字段

| 字段 | 类型 | 说明 |
|---|-|-|
| `action` | string | 动作（类似 Intent Action） |
| `bundleName` | string | 目标包名 |
| `abilityName` | string | 目标 Ability 名 |
| `parameters` | Record | 参数键值对 |
| `entities` | string[] | 实体类型列表 |
| `data` | string | 数据 URI |
| `type` | string | MIME 类型 |
| `deviceId` | string | 目标设备 ID |
| `moduleName` | string | 目标模块名 |
| `uri` | string | URI |

---

## 5. 参数传递类型

### 5.1 支持传递的参数类型

| 类型 | 支持 |
|---|-|
| String | ✅ |
| Number | ✅ |
| Boolean | ✅ |
| ByteArray | ✅ |
| Serializable 对象 | ✅ |
| ParcelObject | ✅ |

```typescript
// 传递基本类型
parameters: {
    name: '小明',
    age: 25,
    isVip: true
}

// 传递复杂对象（需要实现 Serializable）
class User implements Serializable {
    id: number
    name: string
    
    toParcel(): parcel.TextParcel {
        let parcel = new parcel.TextParcel()
        parcel.writeValue('id', this.id)
        parcel.writeValue('name', this.name)
        return parcel
    }
    
    static fromParcel(parcel: parcel.TextParcel): User {
        let user = new User()
        user.id = parcel.readValue('id')
        user.name = parcel.readValue('name')
        return user
    }
}

parameters: {
    user: new User()
}
```

---

## 6. Want  vs Android Intent 对比

| 特性 | Android Intent | HarmonyOS Want |
|---|-|-|
| 启动方式 | startActivity/startService | startAbility/startAbilityForResult |
| 参数传递 | Bundle/Extras | parameters (Record) |
| 隐式匹配 | action + data + category | action + entities + uris |
| 返回结果 | onActivityResult | startAbilityForResult |
| 服务启动 | startService | 不支持直接启动服务 |
| 广播发送 | sendBroadcast | commonEvent |

---

## 7. 面试高频考点

### Q1: Want 的作用？

**回答**：Want 是组件间传递意图的信息载体，用于启动哪个 Ability、传递什么参数。分为显式（指定目标）和隐式（系统匹配）两种。

### Q2: 显式和隐式 Want 的区别？

**回答**：显式直接指定 bundleName 和 abilityName；隐式通过 action/entities/uris 由系统匹配目标。

---

> 🐱 **小猫提示**：Want 记住 **"启动 Ability 的载体、显式指定/隐式匹配、parameters 传参"**。
