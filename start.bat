@echo off
echo ====================================================
echo  Starting CareSentinel+ (Echo Show 15 & MCP Server)
echo ====================================================

echo [1/2] Starting Python MCP Server on http://localhost:8000 ...
start "CareSentinel+ MCP Server" cmd /k "cd mcp-server && python server.py"

echo [2/2] Starting Next.js Frontend Console on http://localhost:3005 ...
start "CareSentinel+ Echo Show Console" cmd /k "cd frontend && npm run dev"

timeout /t 3 >nul
echo Opening Echo Show 15 Smart Display in your browser...
start http://localhost:3005

echo.
echo ====================================================
echo  Both Services Running!
echo  - Frontend: http://localhost:3005
echo  - MCP Server: http://localhost:8000
echo ====================================================
pause
