# OneApp Documentation Build Script
param(
    [switch]$KeepDocs = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "OneApp Documentation Build Script" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\build-docs.ps1         # Build docs and cleanup"
    Write-Host "  .\build-docs.ps1 -KeepDocs  # Build but keep docs"
    Write-Host "  .\build-docs.ps1 -Help      # Show help"
    exit 0
}

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = $ScriptDir
$DocsDir = Join-Path $RootDir "docs"
$SiteDir = Join-Path $RootDir "site"

Write-Host "=== OneApp Documentation Build Start ===" -ForegroundColor Green
Write-Host "Root: $RootDir"
Write-Host "Docs: $DocsDir"
Write-Host "Site: $SiteDir"
Write-Host ""

try {
    Write-Host "Step 1/4: Preparing docs directory..." -ForegroundColor Yellow
    
    if (Test-Path $DocsDir) {
        Remove-Item $DocsDir -Recurse -Force
    }
    
    New-Item -Path $DocsDir -ItemType Directory -Force | Out-Null
    Write-Host "docs directory created" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Step 2/4: Copying source files..." -ForegroundColor Yellow
    
    # Copy markdown files
    Get-ChildItem -Path $RootDir -Filter "*.md" | ForEach-Object {
        Copy-Item $_.FullName -Destination (Join-Path $DocsDir $_.Name) -Force
        Write-Host "Copied: $($_.Name)" -ForegroundColor Gray
    }
    
    # Copy directories
    $Folders = @("account", "after_sales", "app_car", "basic_uis", "basic_utils", 
                 "car_sales", "community", "membership", "service_component", 
                 "setting", "touch_point", "images", "assets")
    
    foreach ($Folder in $Folders) {
        $SourcePath = Join-Path $RootDir $Folder
        if (Test-Path $SourcePath) {
            Copy-Item $SourcePath -Destination (Join-Path $DocsDir $Folder) -Recurse -Force
            Write-Host "Copied folder: $Folder" -ForegroundColor Gray
        }
    }
    
    Write-Host "File copy completed" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Step 3/4: Building MkDocs..." -ForegroundColor Yellow
    
    try {
        $null = Get-Command "python" -ErrorAction Stop
        Write-Host "Python found"
    } catch {
        throw "Python not found. Please install Python first."
    }
    
    Write-Host "Running: python -m mkdocs build --clean"
    & python -m mkdocs build --clean
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful!" -ForegroundColor Green
        
        if (Test-Path $SiteDir) {
            $Files = Get-ChildItem $SiteDir -Recurse -File
            $Size = [math]::Round(($Files | Measure-Object Length -Sum).Sum / 1MB, 2)
            Write-Host "Files: $($Files.Count), Size: $Size MB"
        }
    } else {
        throw "Build failed with exit code: $LASTEXITCODE"
    }
    
    Write-Host ""
    Write-Host "Step 4/4: Cleanup..." -ForegroundColor Yellow
    
    if ($KeepDocs) {
        Write-Host "Keeping docs directory" -ForegroundColor Cyan
    } else {
        if (Test-Path $DocsDir) {
            Remove-Item $DocsDir -Recurse -Force
            Write-Host "docs directory cleaned" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "=== Build Completed ===" -ForegroundColor Green
    Write-Host "Site: $SiteDir" -ForegroundColor Green
    Write-Host "Open: site/index.html" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "=== Build Failed ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ((Test-Path $DocsDir) -and (-not $KeepDocs)) {
        Remove-Item $DocsDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    exit 1
}

Write-Host ""
Write-Host "Press any key..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")