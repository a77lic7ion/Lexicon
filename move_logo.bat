@echo off
copy /Y "e:\GitNew\Lexicon\new logo.png" "e:\GitNew\Lexicon\public\new_logo.png"
if %errorlevel% neq 0 exit /b %errorlevel%
