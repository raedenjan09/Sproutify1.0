param(
  [string]$EnvFile = ".env",
  [string[]]$Environments = @("preview", "production", "development"),
  [string]$Visibility = "plaintext"
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

  if (-not $value) {
    continue
  }

  if (-not $key.StartsWith('EXPO_PUBLIC_')) {
    continue
  }

  Write-Host "Syncing $key to EAS..."

  $args = @('eas', 'env:create', '--name', $key, '--value', $value, '--visibility', $Visibility, '--force', '--non-interactive')
  foreach ($environment in $Environments) {
    $args += '--environment'
    $args += $environment
  }

  & npx.cmd @args
}
