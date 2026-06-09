@echo off
REM ============================================================
REM  Re-render the Foundation brochure to PDF.
REM  1. Drop your photos into the  assets\  folder (see README).
REM  2. Double-click this file.
REM  Output: Shri-Chandrika-Singh-Foundation-Brochure.pdf
REM ============================================================
set "DIR=%~dp0"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

"%CHROME%" --headless=new --no-sandbox --disable-gpu --no-pdf-header-footer ^
  --print-to-pdf="%DIR%Shri-Chandrika-Singh-Foundation-Brochure.pdf" ^
  "file:///%DIR:\=/%brochure.html"

echo.
echo Done. PDF saved next to this file:
echo   %DIR%Shri-Chandrika-Singh-Foundation-Brochure.pdf
echo.
pause
