#!/bin/bash

# Wine Inventory Management System - Initialization Script
# This script sets up and starts the backend and frontend servers

echo ""
echo "========================================"
echo "  红酒库存管理系统 - 初始化脚本"
echo "  Wine Inventory Management System"
echo "========================================"
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "检查系统依赖..."
echo ""

# Check Python
if command_exists python3; then
    PYTHON_CMD=python3
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    echo "[OK] Python $PYTHON_VERSION found"
elif command_exists python; then
    PYTHON_CMD=python
    PYTHON_VERSION=$(python --version 2>&1 | cut -d' ' -f2)
    echo "[OK] Python $PYTHON_VERSION found"
else
    echo "[ERROR] Python not found. Please install Python 3.8+"
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "[OK] Node.js $NODE_VERSION found"
else
    echo "[ERROR] Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "[OK] npm $NPM_VERSION found"
else
    echo "[ERROR] npm not found. Please install npm"
    exit 1
fi

echo ""
echo "设置后端服务..."
echo ""

# Navigate to backend directory
cd "$BACKEND_DIR" || {
    echo "[ERROR] Backend directory not found: $BACKEND_DIR"
    exit 1
}

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "创建 Python 虚拟环境..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
echo "激活虚拟环境..."
if [ -f "venv/Scripts/activate" ]; then
    # Windows (Git Bash)
    source venv/Scripts/activate
else
    # Linux/macOS
    source venv/bin/activate
fi

# Install Python dependencies
echo "安装 Python 依赖..."
pip install -r requirements.txt --quiet

echo ""
echo "设置前端服务..."
echo ""

# Navigate to frontend directory
cd "$FRONTEND_DIR" || {
    echo "[ERROR] Frontend directory not found: $FRONTEND_DIR"
    exit 1
}

# Install Node.js dependencies
echo "安装 Node.js 依赖..."
npm install --silent

echo ""
echo "启动服务..."
echo ""

# Function to start backend server
start_backend() {
    echo "启动后端服务器 (端口 8000)..."
    cd "$BACKEND_DIR"
    if [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo "后端服务器已启动 (PID: $BACKEND_PID)"
}

# Function to start frontend server
start_frontend() {
    echo "启动前端服务器 (端口 5173)..."
    cd "$FRONTEND_DIR"
    npm run dev &
    FRONTEND_PID=$!
    echo "前端服务器已启动 (PID: $FRONTEND_PID)"
}

# Start both servers
start_backend
sleep 2
start_frontend

echo ""
echo "========================================"
echo "  服务启动完成!"
echo ""
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo "========================================"
echo ""

# Wait for user interrupt
trap 'echo ""; echo "正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "服务已停止。"; exit 0' INT

# Keep script running
wait
