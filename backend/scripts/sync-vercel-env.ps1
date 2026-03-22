param(
  [string]$EnvFile = "config/.env",
  [string]$Target = "production"
)

if (-not (Test-Path $EnvFile)) {
  throw "Environment file not found: $EnvFile"
}

$lines = Get-Content $EnvFile

foreach ($rawLine in $lines) {
  $line = $rawLine.Trim()

  if (-not $line -or $line.StartsWith('#')) {
    continue
  }

  $separatorIndex = $line.IndexOf('=')
  if ($separatorIndex -lt 1) {
    continue
  }

  $key = $line.Substring(0, $separatorIndex)
  $value = $line.Substring($separatorIndex + 1)

  if (
    ($value.StartsWith('"') -and $value.EndsWith('"')) -or
    ($value.StartsWith("'") -and $value.EndsWith("'"))
  ) {
    $value = $value.Substring(1, $value.Length - 2)
  }

  if ($key -eq 'PORT') {
    continue
  }

  Write-Host "Syncing $key to Vercel ($Target)..."

  $tempFile = New-TemporaryFile
  Set-Content -Path $tempFile -Value $value -NoNewline

  & npx.cmd --yes vercel env rm $key $Target -y *> $null

  try {
    cmd /c "npx --yes vercel env add $key $Target < `"$tempFile`""
  } finally {
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
  }
}
