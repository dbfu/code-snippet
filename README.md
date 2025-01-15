# 插件介绍

## 全部在vscode中操作，不需要到别的地方复制粘贴

网上有很多代码片段管理平台，但是都都没和vscode编辑器绑定，需要把代码复制到平台，如果想使用，还要从平台上复制出来，这样效率太低了，所以，我写了一个插件，把代码片段管理平台和vscode编辑器绑定，这样，就可以直接在编辑器中管理代码片段，不用再复制粘贴了。

## 快速创建代码片段

虽然vscode支持创建全局代码片段，但是创建的代码格式不友好，需要把多行代码转换为数组，虽然网上有转换的工具，但是还要复制粘贴。我这个插件，可以直接从编辑器里的代码创建。

代码片段代码格式如下，如果不同工具转换，自己手动去写，还是很麻烦的。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-19.png)

## 团队共享代码片段

整个团队，只需要安装这个插件，就可以共享代码片段了。

## 内置常用代码片段

插件中内置了一些常用的代码片段，如果你创建的代码片段是常用的，可以给公开，这样大家都可以使用了。

## 安全

因为代码片段同步到你自己的gitee仓库中，所以，你的代码片段是安全的。

# 插件使用说明

## 使用代码片段

安装完插件后，会自动创建内置公开代码片段文件，创建成功后，需要刷新一下，代码片段快捷键才会生效。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image.png)

在js文件中输入cs，可以弹出代码片段列表，选择一个代码片段，回车后会把代码片段插入到光标处。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-1.png)

也可以在最左边的侧边栏里，看到代码片段列表。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-3.png)

可以点击预览代码片段，也可以把当前代码片段插入到当前光标位置，还可以把代码片段复制到剪切板。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-4.png)

## 创建代码片段

如果你想自己创建代码片段，必须先在gitee上注册一个账号，然后生成一个令牌，然后在vscode设置中配置你的令牌。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-5.png)

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-6.png)

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-7.png)

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-8.png)

令牌配置完成后，然后选中你想保存的代码片段右键，可以看到代码片段的操作菜单下面有三个操作。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-9.png)

### 保存当前文件

把当前文件里所有的代码片段保存为代码片段，输入代码片段标题和描述后保存。

### 保存当前选中代码

把当前选中的代码保存为代码片段，输入代码片段标题和描述后保存。

### 编辑当前选中代码

打开新编辑器，编辑当前选中的代码片段，比如插入变量等，然后再保存。

如何在代码片段中插入变量，可以参考[这篇文章](https://juejin.cn/post/6844903795663568910)。

### 说明

如果保存代码片段时，不想自己输入标题和描述，可以在vscode中配置openai的apiKey，使用大模型来生成标题和描述。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-18.png)

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-17.png)

## 创建代码片段成功

保存成功后，会提示让你刷新一下vscode，因为更改代码片段文件后，需要刷新一下，代码片段快捷键才会生效。

输入cs就能看到刚才新加的代码片段了。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-10.png)

在左侧个人代码片段列表中，也能看到刚刚保存的代码片段。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-11.png)

如果你觉得你的代码片段很常用，建议把代码片段公开，这样，其他用户也能使用。如果不想公开了，可以设置为不公开。同时还支持删除。

欢迎大家公开自己的代码片段，这样，大家就可以一起使用了。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-12.png)

## 团队共享代码片段

如果想要团队共享代码片段，需要在vscode设置中配置团队名称，和gitee令牌。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-13.png)

支持配置多个

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-14.png)

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-15.png)

如果团队里的代码片段有更新，需要自己手动生成一下代码片段文件。

![alt text](https://raw.githubusercontent.com/dbfu/code-snippet/main/images/image-16.png)
