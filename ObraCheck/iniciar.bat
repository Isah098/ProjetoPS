
@echo off
title ObraCheck
cd /d "%~dp0"

echo Iniciando backend...
start "Backend ObraCheck" cmd /k "cd backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload"

echo Iniciando frontend...
start "Frontend ObraCheck" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak >nul

start "" http://localhost:5173
exit
