param(
  [string]$ProjectId = "maia-86c23",
  [string]$Region = "southamerica-east1",
  [string]$JobName = "maia-daily-check-in-notifications",
  [string]$BackendUrl = "https://maia-backend-33fbqbgqka-rj.a.run.app",
  [string]$Schedule = "*/15 * * * *",
  [string]$TimeZone = "Etc/UTC"
)

$ErrorActionPreference = "Stop"

$GCloud = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

if (-not (Test-Path -LiteralPath $GCloud)) {
  $GCloud = "gcloud"
}

& $GCloud config set project $ProjectId
& $GCloud services enable cloudscheduler.googleapis.com

$dispatchSecret = (& $GCloud secrets versions access latest --secret "maia-notification-dispatch-secret" --project $ProjectId).Trim()

if (-not $dispatchSecret) {
  throw "Secret maia-notification-dispatch-secret nao encontrado ou vazio."
}

$uri = "$BackendUrl/api/notifications/dispatch-daily-check-ins/"
$headers = "X-Maia-Dispatch-Secret=$dispatchSecret,Content-Type=application/json"

$jobExists = $false
try {
  & $GCloud scheduler jobs describe $JobName --location $Region --project $ProjectId *> $null
  $jobExists = $LASTEXITCODE -eq 0
} catch {
  $jobExists = $false
}

if ($jobExists) {
  & $GCloud scheduler jobs update http $JobName `
    --location $Region `
    --project $ProjectId `
    --schedule $Schedule `
    --time-zone $TimeZone `
    --uri $uri `
    --http-method POST `
    --update-headers $headers `
    --message-body "{}"
} else {
  & $GCloud scheduler jobs create http $JobName `
    --location $Region `
    --project $ProjectId `
    --schedule $Schedule `
    --time-zone $TimeZone `
    --uri $uri `
    --http-method POST `
    --headers $headers `
    --message-body "{}"
}

& $GCloud scheduler jobs describe $JobName `
  --location $Region `
  --project $ProjectId `
  --format "table(name,state,schedule,timeZone,httpTarget.uri)"
