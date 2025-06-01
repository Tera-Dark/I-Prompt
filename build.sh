#!/bin/bash
echo "开始构建 I-Prompt 应用..."
chmod +x node_modules/.bin/react-scripts 2>/dev/null || true
npm run build
echo "构建完成！" 