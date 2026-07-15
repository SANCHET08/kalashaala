param(
    [string]$RootUser = "root",
    [string]$SqlFile = ".\mysql_setup.sql"
)

if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
    Write-Error "MySQL CLI was not found. Install MySQL Server and add mysql.exe to PATH, then run this script again."
    exit 1
}

if (-not (Test-Path -LiteralPath $SqlFile)) {
    Write-Error "SQL setup file was not found: $SqlFile"
    exit 1
}

mysql -u $RootUser -p -e "SOURCE $((Resolve-Path -LiteralPath $SqlFile).Path.Replace('\', '/'));"
