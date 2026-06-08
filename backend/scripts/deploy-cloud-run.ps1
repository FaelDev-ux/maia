param(
  [string]$ProjectId = "maia-86c23",
  [string]$Region = "southamerica-east1",
  [string]$ServiceName = "maia-backend"
)

$ErrorActionPreference = "Stop"

$GCloud = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

if (-not (Test-Path -LiteralPath $GCloud)) {
  $GCloud = "gcloud"
}

& $GCloud config set project $ProjectId
& $GCloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com

function Get-LocalEnvValue {
  param([string]$Name)

  $envPath = Join-Path $PSScriptRoot "..\.env"

  if (-not (Test-Path -LiteralPath $envPath)) {
    return $null
  }

  $line = Get-Content -LiteralPath $envPath | Where-Object { $_ -match "^$Name=" } | Select-Object -First 1

  if (-not $line) {
    return $null
  }

  return $line.Substring($Name.Length + 1)
}

function Write-Utf8NoBomFile {
  param(
    [string]$Path,
    [string]$Value
  )

  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Value, $encoding)
}

function Set-SecretValue {
  param(
    [string]$Name,
    [string]$Value,
    [string]$DataFile
  )

  $createdTempFile = $false

  try {
    if (-not $DataFile) {
      $DataFile = [System.IO.Path]::GetTempFileName()
      Write-Utf8NoBomFile -Path $DataFile -Value $Value
      $createdTempFile = $true
    }

    $secretExists = $false
    try {
      & $GCloud secrets describe $Name --project $ProjectId *> $null
      $secretExists = $LASTEXITCODE -eq 0
    } catch {
      $secretExists = $false
    }

    if (-not $secretExists) {
      & $GCloud secrets create $Name --replication-policy automatic --data-file $DataFile
      if ($LASTEXITCODE -ne 0) {
        throw "Failed to create Secret Manager secret: $Name"
      }

      return
    }

    & $GCloud secrets versions add $Name --data-file $DataFile
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to add a new version to Secret Manager secret: $Name"
    }
  } finally {
    if ($createdTempFile -and (Test-Path -LiteralPath $DataFile)) {
      Remove-Item -LiteralPath $DataFile -Force
    }
  }
}

function Grant-SecretAccess {
  param(
    [string]$Name,
    [string]$ServiceAccount
  )

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & $GCloud secrets add-iam-policy-binding $Name `
      --project $ProjectId `
      --member "serviceAccount:${ServiceAccount}" `
      --role "roles/secretmanager.secretAccessor" `
      2> $null | Out-Null
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to grant Secret Manager access for secret: $Name"
  }
}

$firebaseSecret = "maia-firebase-service-account"
$djangoSecret = "maia-django-secret-key"
$firebaseWebApiKeySecret = "maia-firebase-web-api-key"
$firebaseKeyPath = Join-Path $PSScriptRoot "..\firebase.json"
$djangoSecretKey = Get-LocalEnvValue "DJANGO_SECRET_KEY"
$firebaseWebApiKey = Get-LocalEnvValue "FIREBASE_WEB_API_KEY"

if (Test-Path -LiteralPath $firebaseKeyPath) {
  Set-SecretValue -Name $firebaseSecret -DataFile $firebaseKeyPath
}

if ($djangoSecretKey) {
  Set-SecretValue -Name $djangoSecret -Value $djangoSecretKey
}

if ($firebaseWebApiKey) {
  Set-SecretValue -Name $firebaseWebApiKeySecret -Value $firebaseWebApiKey
}

$projectNumber = (& $GCloud projects describe $ProjectId --format "value(projectNumber)").Trim()
$revisionServiceAccount = "$projectNumber-compute@developer.gserviceaccount.com"

Grant-SecretAccess -Name $firebaseSecret -ServiceAccount $revisionServiceAccount
Grant-SecretAccess -Name $djangoSecret -ServiceAccount $revisionServiceAccount
Grant-SecretAccess -Name $firebaseWebApiKeySecret -ServiceAccount $revisionServiceAccount

$sourcePath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

& $GCloud run deploy $ServiceName `
  --quiet `
  --source $sourcePath `
  --region $Region `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 3 `
  --set-env-vars "DJANGO_DEBUG=false,DJANGO_ALLOWED_HOSTS=.run.app,DJANGO_CORS_ALLOW_ALL_ORIGINS=false,DJANGO_TIME_ZONE=America/Fortaleza,FIREBASE_STORAGE_BUCKET=maia-86c23.firebasestorage.app" `
  --update-secrets "FIREBASE_CREDENTIALS_JSON=${firebaseSecret}:latest,DJANGO_SECRET_KEY=${djangoSecret}:latest,FIREBASE_WEB_API_KEY=${firebaseWebApiKeySecret}:latest"
