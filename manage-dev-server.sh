#!/bin/bash

# Next.js 开发服务器管理脚本

PORT=3000
PROJECT_NAME="interview-assistant-frontend"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo -e "${BLUE}Next.js 开发服务器管理工具${NC}"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start     启动开发服务器"
    echo "  stop      停止开发服务器"
    echo "  restart   重启开发服务器"
    echo "  status    查看服务器状态"
    echo "  kill      强制终止所有相关进程"
    echo "  help      显示此帮助信息"
    echo ""
}

# 检查端口状态
check_port() {
    local pid=$(lsof -ti :$PORT)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}端口 $PORT 被进程 $pid 占用${NC}"
        return 0
    else
        echo -e "${GREEN}端口 $PORT 空闲${NC}"
        return 1
    fi
}

# 查看服务器状态
show_status() {
    echo -e "${BLUE}=== 服务器状态 ===${NC}"
    
    # 检查端口
    if check_port; then
        local pid=$(lsof -ti :$PORT)
        echo -e "${GREEN}✅ 开发服务器正在运行 (PID: $pid)${NC}"
        
        # 显示进程详情
        echo -e "\n${BLUE}进程详情:${NC}"
        ps -p $pid -o pid,ppid,command
        
        # 测试连接
        echo -e "\n${BLUE}连接测试:${NC}"
        if curl -s http://localhost:$PORT > /dev/null; then
            echo -e "${GREEN}✅ HTTP 连接正常${NC}"
        else
            echo -e "${RED}❌ HTTP 连接失败${NC}"
        fi
    else
        echo -e "${RED}❌ 开发服务器未运行${NC}"
    fi
    
    # 检查 Node.js 进程
    echo -e "\n${BLUE}相关 Node.js 进程:${NC}"
    ps aux | grep -E "(next|npm.*dev)" | grep -v grep || echo "无相关进程"
}

# 启动服务器
start_server() {
    echo -e "${BLUE}启动开发服务器...${NC}"
    
    if check_port; then
        echo -e "${YELLOW}服务器已在运行，无需启动${NC}"
        return 1
    fi
    
    echo -e "${GREEN}正在启动 Next.js 开发服务器...${NC}"
    npm run dev &
    
    # 等待服务器启动
    echo -e "${YELLOW}等待服务器启动...${NC}"
    for i in {1..10}; do
        sleep 2
        if curl -s http://localhost:$PORT > /dev/null; then
            echo -e "${GREEN}✅ 服务器启动成功！${NC}"
            echo -e "${BLUE}访问地址: http://localhost:$PORT${NC}"
            return 0
        fi
        echo -n "."
    done
    
    echo -e "\n${RED}❌ 服务器启动超时${NC}"
    return 1
}

# 停止服务器
stop_server() {
    echo -e "${BLUE}停止开发服务器...${NC}"
    
    local pid=$(lsof -ti :$PORT)
    if [ -z "$pid" ]; then
        echo -e "${YELLOW}服务器未运行${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}正在停止进程 $pid...${NC}"
    
    # 尝试优雅停止
    kill $pid 2>/dev/null
    
    # 等待进程结束
    for i in {1..5}; do
        sleep 1
        if ! kill -0 $pid 2>/dev/null; then
            echo -e "${GREEN}✅ 服务器已停止${NC}"
            return 0
        fi
        echo -n "."
    done
    
    # 强制终止
    echo -e "\n${YELLOW}强制终止进程...${NC}"
    kill -9 $pid 2>/dev/null
    
    sleep 1
    if ! kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ 服务器已强制停止${NC}"
    else
        echo -e "${RED}❌ 无法停止服务器${NC}"
        return 1
    fi
}

# 强制终止所有相关进程
kill_all() {
    echo -e "${RED}强制终止所有相关进程...${NC}"
    
    # 终止端口占用进程
    local pids=$(lsof -ti :$PORT)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}终止端口 $PORT 相关进程: $pids${NC}"
        kill -9 $pids 2>/dev/null
    fi
    
    # 终止 Next.js 相关进程
    local next_pids=$(pgrep -f "next dev")
    if [ ! -z "$next_pids" ]; then
        echo -e "${YELLOW}终止 Next.js 进程: $next_pids${NC}"
        kill -9 $next_pids 2>/dev/null
    fi
    
    # 终止 npm dev 相关进程
    local npm_pids=$(pgrep -f "npm.*dev")
    if [ ! -z "$npm_pids" ]; then
        echo -e "${YELLOW}终止 npm dev 进程: $npm_pids${NC}"
        kill -9 $npm_pids 2>/dev/null
    fi
    
    sleep 1
    echo -e "${GREEN}✅ 清理完成${NC}"
}

# 重启服务器
restart_server() {
    echo -e "${BLUE}重启开发服务器...${NC}"
    stop_server
    sleep 2
    start_server
}

# 主逻辑
case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        show_status
        ;;
    kill)
        kill_all
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}未知命令: $1${NC}"
        show_help
        exit 1
        ;;
esac
